import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from geopy.distance import geodesic
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import os

TRANSACTION_FILE = "transactions.csv"
BLOCKLIST_FILE = "blocklist.csv"

# -------------------------
# 1. Load or Create Files
# -------------------------
def load_transaction_data(file_path):
    if not os.path.exists(file_path):
        df = pd.DataFrame(columns=['timestamp', 'sender', 'receiver', 'amount', 'latitude', 'longitude'])
        df.to_csv(file_path, index=False)
    df = pd.read_csv(file_path)
    
    # Fix timestamp format - assuming timestamps are in format "MM:SS.MS" (minutes:seconds.milliseconds)
    # Add current date to make it a complete datetime
    current_date = datetime.now().date()
    
    # Function to convert time string to datetime
    def convert_time(time_str):
        try:
            # Handle different time formats
            if ':' in time_str:
                # Format like "51:43.1" - treat as minutes:seconds
                parts = time_str.split(':')
                if len(parts) == 2:
                    minutes, seconds = parts
                    # Handle seconds with decimal
                    if '.' in seconds:
                        seconds, milliseconds = seconds.split('.')
                    else:
                        milliseconds = '0'
                    
                    # Convert to timedelta and add to current date
                    time_delta = timedelta(
                        minutes=int(minutes),
                        seconds=int(seconds),
                        milliseconds=int(milliseconds) * 100
                    )
                    return datetime.combine(current_date, datetime.min.time()) + time_delta
                else:
                    # If format is different, return current time
                    return datetime.now()
            else:
                # If format is completely different, return current time
                return datetime.now()
        except Exception as e:
            print(f"Error converting time {time_str}: {e}")
            return datetime.now()
    
    # Apply the conversion function
    df['timestamp'] = df['timestamp'].apply(convert_time)
    
    # Drop any rows with invalid timestamps
    df = df.dropna(subset=['timestamp'])
    df.sort_values(by=["timestamp"], inplace=True)
    df.reset_index(drop=True, inplace=True)
    return df

def load_blocklist():
    if not os.path.exists(BLOCKLIST_FILE):
        pd.DataFrame(columns=['user_id', 'reason']).to_csv(BLOCKLIST_FILE, index=False)
    return pd.read_csv(BLOCKLIST_FILE)

# -------------------------
# 2. Transaction Entry
# -------------------------
def add_transaction():
    while True:
        try:
            print("\n--- New Transaction Entry ---")
            timestamp = datetime.now()
            
            blocklist = load_blocklist()
            
            sender = input("Enter sender ID (alphanumeric, 3-20 chars): ").strip()
            if not (3 <= len(sender) <= 20 and sender.isalnum()):
                raise ValueError("Invalid sender ID format")
            if sender in blocklist['user_id'].values:
                raise ValueError("Sender is blocklisted - unauthorized")
                
            receiver = input("Enter receiver ID (alphanumeric, 3-20 chars): ").strip()
                
            amount = float(input("Enter amount (0.01-1000000): "))
            if not 0.01 <= amount <= 1000000:
                raise ValueError("Amount out of range")
                
            latitude = float(input("Enter latitude (-90 to 90): "))
            if not -90 <= latitude <= 90:
                raise ValueError("Invalid latitude")
                
            longitude = float(input("Enter longitude (-180 to 180): "))
            if not -180 <= longitude <= 180:
                raise ValueError("Invalid longitude")

            # Get optional immediate score adjustments
            adjust_now = input("Adjust scores now? (y/n): ").lower()
            if adjust_now == 'y':
                sender_adjust = int(input(f"Adjust {sender}'s score (-10 to +10): "))
                receiver_adjust = int(input(f"Adjust {receiver}'s score (-10 to +10): "))
            else:
                sender_adjust = receiver_adjust = 0

            new_entry = pd.DataFrame([{
                'timestamp': timestamp,
                'sender': sender,
                'receiver': receiver,
                'amount': amount,
                'latitude': latitude,
                'longitude': longitude,
                'sender_adjustment': sender_adjust,
                'receiver_adjustment': receiver_adjust
            }])

            new_entry.to_csv(TRANSACTION_FILE, mode='a', header=not os.path.exists(TRANSACTION_FILE), index=False)
            print("✅ Transaction added successfully.")
            break
            
        except ValueError as e:
            print(f"❌ Error: {e}. Please try again.")

# -------------------------
# 3. Rule-based Scoring (Sender Only)
# -------------------------
def compute_rule_based_score(df):
    # Create a proper copy of the DataFrame to avoid SettingWithCopyWarning
    df = df.copy()
    
    sender_scores = {}
    receiver_scores = {}
    last_locations = {}

    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
    df = df.dropna(subset=['amount'])

    df['date_only'] = df['timestamp'].dt.date
    daily_averages = df.groupby(['sender', 'date_only'])['amount'].mean().to_dict()

    # Get user input for score adjustments
    adjust_sender = input("Enter sender ID to adjust score (or press Enter to skip): ")
    if adjust_sender:
        sender_adjustment = int(input(f"Enter score adjustment for {adjust_sender}: "))
    
    adjust_receiver = input("Enter receiver ID to adjust score (or press Enter to skip): ")
    if adjust_receiver:
        receiver_adjustment = int(input(f"Enter score adjustment for {adjust_receiver}: "))

    for idx, row in df.iterrows():
        sender = row['sender']
        receiver = row['receiver']
        score_sender = 0
        score_receiver = 0

        # Apply user-specified adjustments
        if adjust_sender and sender == adjust_sender:
            score_sender += sender_adjustment
        if adjust_receiver and receiver == adjust_receiver:
            score_receiver += receiver_adjustment

        daily_key = (sender, row['date_only'])
        avg_daily = daily_averages.get(daily_key, 200)
        threshold = avg_daily * 2.5

        # Amount-based scoring
        if row['amount'] > threshold * 3:
            score_sender += 3
            score_receiver += 1
        elif row['amount'] > threshold * 2:
            score_sender += 2
            score_receiver += 1
        elif row['amount'] > threshold:
            score_sender += 1

        # Time-based scoring
        if idx > 0 and df.loc[idx-1, 'sender'] == sender:
            time_diff = (row['timestamp'] - df.loc[idx-1, 'timestamp']).total_seconds() / 60
            if time_diff < 2:
                score_sender += 3
            elif time_diff < 5:
                score_sender += 2
            elif time_diff < 10:
                score_sender += 1

        # Location-based scoring
        curr_loc = (row['latitude'], row['longitude'])
        if sender in last_locations:
            dist = geodesic(curr_loc, last_locations[sender]).km
            if dist > 100:
                score_sender += 4
        last_locations[sender] = curr_loc

        # Update both sender and receiver scores
        sender_scores[sender] = sender_scores.get(sender, 0) + score_sender
        receiver_scores[receiver] = receiver_scores.get(receiver, 0) + score_receiver

    return sender_scores, receiver_scores

# -------------------------
# 4. ML-based Scoring (Sender Only)
# -------------------------
def compute_ml_scores(df):
    # Ensure 'amount' column is numeric
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
    
    # Drop rows with NaN amounts
    df = df.dropna(subset=['amount'])
    
    # Use only the 'amount' column for features
    features = df[['amount']].copy()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    iso_sender = IsolationForest(contamination=0.15)
    df['ml_anomaly_sender'] = iso_sender.fit_predict(X_scaled)

    sender_scores = {}
    receiver_scores = {}

    for idx, row in df.iterrows():
        # Apply ML anomaly to both sender and receiver (with lower weight for receiver)
        sender_anomaly = 3 if row['ml_anomaly_sender'] == -1 else 0
        receiver_anomaly = 1 if row['ml_anomaly_sender'] == -1 else 0
        
        sender_scores[row['sender']] = sender_scores.get(row['sender'], 0) + sender_anomaly
        receiver_scores[row['receiver']] = receiver_scores.get(row['receiver'], 0) + receiver_anomaly

    return sender_scores, receiver_scores

# -------------------------
# 5. Blocklist Management
# -------------------------
def update_blocklist(user_id, reason):
    blocklist = load_blocklist()
    if user_id not in blocklist['user_id'].values:
        new_entry = pd.DataFrame([{'user_id': user_id, 'reason': reason}])
        blocklist = pd.concat([blocklist, new_entry], ignore_index=True)
        blocklist.to_csv(BLOCKLIST_FILE, index=False)
        print(f"🚨 User {user_id} added to blocklist: {reason}")

# -------------------------
# 6. Score Display with Thresholds
# -------------------------
def display_risk_scores(sender_rule, receiver_rule, sender_ml, receiver_ml):
    all_users = set(sender_rule) | set(receiver_rule) | set(sender_ml) | set(receiver_ml)
    blocklist = load_blocklist()

    print("\n🔍 Risk Assessment Results:")
    for user in all_users:
        total_score = min(
            sender_rule.get(user, 0) + receiver_rule.get(user, 0) +
            sender_ml.get(user, 0) + receiver_ml.get(user, 0),
            100
        )

        if user in blocklist['user_id'].values:
            print(f"{user}: BLOCKLISTED (previously flagged)")
        elif total_score >= 90:
            update_blocklist(user, f"High risk score: {total_score}")
            print(f"{user}: {total_score} [🚨 FRAUD - BLOCKLISTED]")
        elif total_score >= 50:
            print(f"{user}: {total_score} [⚠ SUSPICIOUS - Needs review]")
        else:
            print(f"{user}: {total_score} [✅ LEGITIMATE]")

# -------------------------
# 7. Main Menu
# -------------------------
def main():
    while True:
        print("\n------ Fraud Detection Menu ------")
        print("1. Add Transaction")
        print("2. Compute Risk Scores")
        print("3. View Blocklist")
        print("4. Exit")
        choice = input("Enter your choice: ")

        if choice == '1':
            add_transaction()
        elif choice == '2':
            df = load_transaction_data(TRANSACTION_FILE)
            sender_rule, receiver_rule = compute_rule_based_score(df)
            sender_ml, receiver_ml = compute_ml_scores(df)
            display_risk_scores(sender_rule, receiver_rule, sender_ml, receiver_ml)
            df.to_csv("enhanced_fraud_data.csv", index=False)
        elif choice == '3':
            blocklist = load_blocklist()
            print("\n🚨 Blocklisted Users:")
            print(blocklist.to_string(index=False) if not blocklist.empty else "No users in blocklist")
        elif choice == '4':
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()