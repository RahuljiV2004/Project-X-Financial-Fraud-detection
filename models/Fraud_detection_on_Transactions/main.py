import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# --- Step 1: Generate synthetic transaction data ---
np.random.seed(42)
n_samples = 10000

data = {
    "TransactionAmount": np.random.exponential(scale=200, size=n_samples),
    "TransactionDuration": np.random.normal(loc=5, scale=2, size=n_samples),
    "LoginAttempts": np.random.randint(1, 5, size=n_samples),
    "AccountBalance": np.random.normal(loc=15000, scale=5000, size=n_samples),
    "TimeGap": np.random.randint(10, 5000, size=n_samples),
    "Hour": np.random.randint(0, 24, size=n_samples),
    "DayOfWeek": np.random.randint(0, 7, size=n_samples),
    "IsFraud": np.random.choice([0, 1], size=n_samples, p=[0.95, 0.05])  # 5% fraud
}

df = pd.DataFrame(data)

# Optional: Simulate some correlation (fraud patterns)
df.loc[df['IsFraud'] == 1, 'TransactionAmount'] *= 3
df.loc[df['IsFraud'] == 1, 'LoginAttempts'] += 2
df.loc[df['IsFraud'] == 1, 'AccountBalance'] *= 0.3

# --- Step 2: Preprocess ---
features = [
    "TransactionAmount", "TransactionDuration", "LoginAttempts",
    "AccountBalance", "TimeGap", "Hour", "DayOfWeek"
]

X = df[features]
y = df["IsFraud"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# --- Step 3: Train-test split ---
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# --- Step 4: Train model ---
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# --- Step 5: Evaluate ---
y_pred = model.predict(X_test)
print("📊 Classification Report:")
print(classification_report(y_test, y_pred))

# --- Step 6: Save model and scaler ---
joblib.dump(model, "fraud_rf_model.pkl")
joblib.dump(scaler, "scaler.pkl")
print("✅ Model and scaler saved.")
