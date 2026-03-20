import { NextResponse } from 'next/server';
import twilio from 'twilio';
import { getRedisClient } from '@/lib/redis';

// Helper to get app-specific index key
function getAppIndexKey(app) {
  return `todos:index:${app}`;
}

// Get todos for a specific app
async function getTodosForApp(redis, app) {
  const appIndexKey = getAppIndexKey(app);
  const todoIds = await redis.zRange(appIndexKey, 0, -1);

  if (!todoIds || todoIds.length === 0) return [];

  const todos = await Promise.all(
    todoIds.map(async (id) => {
      const todo = await redis.hGetAll(`todo:${id}`);
      return todo;
    })
  );

  return todos.filter((todo) => todo && todo.id && todo.completed !== 'true');
}

export async function POST(request) {
  try {
    const { action } = await request.json();

    // Check for required Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const toNumber = process.env.ALERT_PHONE_NUMBER;

    // Debug: log which vars are present
    console.log('Twilio config:', {
      hasAccountSid: !!accountSid,
      hasAuthToken: !!authToken,
      hasFromNumber: !!fromNumber,
      hasToNumber: !!toNumber,
    });

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      return NextResponse.json(
        {
          error: 'Twilio credentials not configured',
          details: {
            accountSid: !!accountSid,
            authToken: !!authToken,
            fromNumber: !!fromNumber,
            toNumber: !!toNumber,
          }
        },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    if (action === 'daily-summary') {
      const redis = await getRedisClient();

      // Get todos for both apps
      const chatterboxTodos = await getTodosForApp(redis, 'chatterbox');
      const happyHeartsTodos = await getTodosForApp(redis, 'happyhearts');

      const totalActive = chatterboxTodos.length + happyHeartsTodos.length;

      if (totalActive === 0) {
        return NextResponse.json({
          message: 'No active todos, skipping SMS',
          sent: false,
        });
      }

      // Build message
      let message = `📋 Daily Todo Summary:\n\n`;

      if (chatterboxTodos.length > 0) {
        message += `Chatterbox Systems: ${chatterboxTodos.length} active\n`;
        // List first 3
        chatterboxTodos.slice(0, 3).forEach((todo) => {
          message += `• ${todo.title}\n`;
        });
        if (chatterboxTodos.length > 3) {
          message += `...and ${chatterboxTodos.length - 3} more\n`;
        }
      }

      if (happyHeartsTodos.length > 0) {
        message += `\nHappy Hearts Today: ${happyHeartsTodos.length} active\n`;
        happyHeartsTodos.slice(0, 3).forEach((todo) => {
          message += `• ${todo.title}\n`;
        });
        if (happyHeartsTodos.length > 3) {
          message += `...and ${happyHeartsTodos.length - 3} more\n`;
        }
      }

      message += `\nTotal: ${totalActive} active todos`;

      // Debug: Log phone numbers
      console.log('Sending SMS from:', fromNumber, 'to:', toNumber);

      // Send SMS
      const twilioMessage = await client.messages.create({
        body: message,
        from: fromNumber,
        to: toNumber,
      });

      console.log('Twilio message SID:', twilioMessage.sid, 'Status:', twilioMessage.status);

      return NextResponse.json({
        message: 'Daily summary sent',
        sent: true,
        chatterboxCount: chatterboxTodos.length,
        happyHeartsCount: happyHeartsTodos.length,
        twilioSid: twilioMessage.sid,
        twilioStatus: twilioMessage.status,
        fromNumber,
        toNumber,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}