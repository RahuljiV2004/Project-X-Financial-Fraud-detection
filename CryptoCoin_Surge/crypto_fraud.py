from twilio.rest import Client

# Twilio credentials (keep secure)
account_sid = 'AC27645f714c34b166195ffad070805818'
auth_token = '2371c5e3ab2734a52586324da0639019'
twilio_number = '+15734104884'
to_number = '+919360763668'
twiml_url = 'https://handler.twilio.com/twiml/EH5cf01a9c0b3ee96ccf9e83829076434d'

# Initialize Twilio client
client = Client(account_sid, auth_token)

def notify_spike(symbol, spike_value):
    if 50 <= spike_value <= 200:
        message = client.messages.create(
            body=f"Alert 🚨 {symbol} spike detected! Value: {spike_value}",
            from_=twilio_number,
            to=to_number
        )
        print(f"SMS sent. SID: {message.sid}")

    elif spike_value > 200:
        call = client.calls.create(
            to=to_number,
            from_=twilio_number,
            url=twiml_url
        )
        print(f"Call initiated. SID: {call.sid}")

    else:
        print("Spike is below threshold, no alert sent.")
