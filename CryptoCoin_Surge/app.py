from flask import Flask, request, jsonify
from flask_cors import CORS
from twilio.rest import Client

app = Flask(__name__)
CORS(app)

# Twilio credentials (keep secure)
account_sid = 'AC27645f714c34b166195ffad070805818'
auth_token = '2371c5e3ab2734a52586324da0639019'
twilio_number = '+15734104884'
to_number = '+919360763668'
twiml_url = 'https://handler.twilio.com/twiml/EH5cf01a9c0b3ee96ccf9e83829076434d'

# Initialize Twilio client
client = Client(account_sid, auth_token)

@app.route('/notify', methods=['POST'])
def notify():
    data = request.json
    symbol = data.get('symbol')
    spike_value = data.get('spike_value')
    
    if not symbol or spike_value is None:
        return jsonify({'error': 'Missing symbol or spike value'}), 400
    
    try:
        if 50 <= spike_value <= 200:
            message = client.messages.create(
                body=f"🚨 Alert: {symbol} has a {spike_value:.2f}% spike!",
                from_=twilio_number,
                to=to_number
            )
            return jsonify({'status': 'message_sent', 'sid': message.sid})
            
        elif spike_value > 200:
            call = client.calls.create(
                to=to_number,
                from_=twilio_number,
                url=twiml_url
            )
            return jsonify({'status': 'call_initiated', 'sid': call.sid})
            
        return jsonify({'status': 'below_threshold'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 