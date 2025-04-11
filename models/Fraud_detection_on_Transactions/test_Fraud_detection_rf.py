import pandas as pd
import joblib

# Load model and scaler
model = joblib.load("fraud_rf_model.pkl")
scaler = joblib.load("scaler.pkl")

# New transaction (simulate a suspicious one)
new_transaction = {
    "TransactionAmount": 150,
    "TransactionDuration": 12.0,
    "LoginAttempts": 1,
    "AccountBalance": 12000,
    "TimeGap": 600,  # 10 minutes since last transaction
    "Hour": 11,
    "DayOfWeek": 2  # Wednesday
}

df = pd.DataFrame([new_transaction])
X_scaled = scaler.transform(df)

# Predict
prediction = model.predict(X_scaled)[0]
proba = model.predict_proba(X_scaled)[0][1]

print("\n🔍 Transaction Analysis:")
print(f"Fraud Prediction: {'🚨 FRAUD' if prediction == 1 else '✅ Normal'}")
print(f"Confidence (fraud): {proba:.2f}")
