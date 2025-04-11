import pandas as pd
from datetime import datetime, timedelta
from geopy.distance import geodesic
import random

# -----------------------
# Simulated CSV Generation
# -----------------------
def generate_sample_csv(file_path="transactions.csv"):
    users = ["U1", "U2", "U3","U4","U5","U6","U7","U8"]
    cities = {
        "New York": (40.7128, -74.0060),
        "Los Angeles": (34.0522, -118.2437),
        "Chennai": (13.0827, 80.2707),
        "Pondicherry": (11.9139, 79.8145),
        "Delhi": (28.7041, 77.1025),
    }
    data = []
    timestamp = datetime.now() - timedelta(days=1)
    # Generate normal transactions
    for _ in range(80):
        sender = random.choice(users)
        receiver = random.choice([u for u in users if u != sender])
        amount = random.randint(10, 5000)
        city = random.choice(list(cities.keys()))
        lat, lon = cities[city]
        timestamp += timedelta(minutes=random.randint(1, 120))
        data.append([sender, receiver, amount, timestamp.strftime('%Y-%m-%d %H:%M:%S'), lat, lon])

    # Generate rapid transactions (3+ within 5 minutes)
    for _ in range(20):
        sender = random.choice(users)
        window_start = timestamp
        for i in range(3):  # Minimum 3 transactions for rapid pattern
            receiver = random.choice([u for u in users if u != sender])
            amount = random.randint(10, 5000)
            city = random.choice(list(cities.keys()))
            lat, lon = cities[city]
            timestamp += timedelta(minutes=random.randint(1, 4))  # Transactions within 5 min window
            data.append([sender, receiver, amount, timestamp.strftime('%Y-%m-%d %H:%M:%S'), lat, lon])
    df = pd.DataFrame(data, columns=["sender", "receiver", "amount", "timestamp", "latitude", "longitude"])
    df.to_csv(file_path, index=False)
    print(f"Sample transaction data written to {file_path}")

# -----------------------
# Load and Parse Data
# -----------------------
def load_data(file_path="transactions_moneylaundering.csv"):
    df = pd.read_csv(file_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    return df

# -----------------------
# Geolocation Analysis
# -----------------------
def detect_geolocation_mismatch(df, threshold_km=5000):
    alerts = []
    last_locations = {}
    df_sorted = df.sort_values(by=["sender", "timestamp"])
    for _, row in df_sorted.iterrows():
        user = row["sender"]
        curr_location = (row["latitude"], row["longitude"])
        if user in last_locations:
            prev_location, prev_time = last_locations[user]
            distance = geodesic(prev_location, curr_location).km
            time_diff = (row["timestamp"] - prev_time).total_seconds() / 3600
            if distance > threshold_km and time_diff < 2:  # Travelled 1000+ km in < 2 hours
                alerts.append({
                    "user": user,
                    "type": "Geolocation Mismatch",
                    "distance_km": round(distance, 2),
                    "time_diff_hr": round(time_diff, 2),
                    "from": prev_location,
                    "to": curr_location,
                    "timestamp": row["timestamp"]
                })
        last_locations[user] = (curr_location, row["timestamp"])
    return alerts

# -----------------------
# Time-Series Rapid Transaction Detection
# -----------------------
def detect_rapid_transactions(df, window_minutes=5, max_txn=3):
    alerts = []
    df_sorted = df.sort_values(by=["sender", "timestamp"])
    for user in df_sorted["sender"].unique():
        user_txns = df_sorted[df_sorted["sender"] == user]
        for i in range(len(user_txns)):
            window_start = user_txns.iloc[i]["timestamp"]
            window_end = window_start + timedelta(minutes=window_minutes)
            txn_count = user_txns[(user_txns["timestamp"] >= window_start) & (user_txns["timestamp"] <= window_end)]
            if len(txn_count) >= max_txn:
                alerts.append({
                    "user": user,
                    "type": "Rapid Transaction",
                    "count": len(txn_count),
                    "start_time": window_start,
                    "end_time": window_end
                })
                break  # Avoid repeated alerts
    return alerts

# -----------------------
# Main Execution
# -----------------------
if __name__ == "__main__":
    #generate_sample_csv()
    df = load_data()

    geo_alerts = detect_geolocation_mismatch(df)
    rapid_alerts = detect_rapid_transactions(df)

    print("\n--- Geolocation Mismatch Alerts ---")
    for alert in geo_alerts:
        print(alert)

    print("\n--- Rapid Transaction Alerts ---")
    for alert in rapid_alerts:
        print(alert)

    # Combine and sort alerts by severity (geolocation first) and timestamp
    high_concern_users = []
    
    # Add geolocation alerts with high priority
    for alert in geo_alerts:
        high_concern_users.append({
            **alert,
            'priority': 1  # Highest priority
        })
    
    # Add rapid transaction alerts
    for alert in rapid_alerts:
        high_concern_users.append({
            **alert,
            'priority': 2  # Lower priority
        })
    
    # Sort by priority then timestamp
    high_concern_users_sorted = sorted(
        high_concern_users,
        key=lambda x: (x['priority'], x.get('timestamp', datetime.min))
    )

    print("\n--- Top 10 High Concern Users ---")
    for user in high_concern_users_sorted[:10]:
        print(f"User: {user['user']}")
        print(f"Alert Type: {user['type']}")
        if 'distance_km' in user:
            print(f"Distance: {user['distance_km']} km")
            print(f"Time Difference: {user['time_diff_hr']} hours")
        if 'count' in user:
            print(f"Transaction Count: {user['count']}")
        if 'timestamp' in user:
            print(f"Timestamp: {user['timestamp']}")
        print("---")
