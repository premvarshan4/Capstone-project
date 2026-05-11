import pandas as pd
import os
import json

# 📁 Folder path
folder_path = "C:/Users/prem/Downloads/all-india-villages-master-list-excel/dataset"

all_data = []

# 🚀 STEP 1: Read all Excel files
for file in os.listdir(folder_path):
    if file.endswith(".xlsx") or file.endswith(".xls"):
        file_path = os.path.join(folder_path, file)
        print(f"Reading: {file}")
        
        df = pd.read_excel(file_path)
        all_data.append(df)

# 🚀 STEP 2: Combine all files
final_df = pd.concat(all_data, ignore_index=True)

print("Before Cleaning:", final_df.shape)
print(final_df.columns)

# 🚀 STEP 3: Remove unwanted columns (Unnamed)
final_df = final_df.loc[:, ~final_df.columns.str.contains('^Unnamed')]

# 🚀 STEP 4: Drop completely empty rows
final_df = final_df.dropna(how='all')

# 🚀 STEP 5: Reset index
final_df = final_df.reset_index(drop=True)

print("After Cleaning:", final_df.shape)
print(final_df.columns)

# 🚀 STEP 6: Rename columns (standard format)
final_df.columns = [
    "state_code",
    "state_name",
    "district_code",
    "district_name",
    "subdistrict_code",
    "subdistrict_name",
    "village_code",
    "village_name"
]

# 🚀 STEP 7: Convert everything to string
final_df = final_df.astype(str)

# 🚀 STEP 8: Clean text (remove spaces, standard format)
for col in ["state_name", "district_name", "subdistrict_name", "village_name"]:
    final_df[col] = final_df[col].str.strip().str.title()

# 🚀 STEP 9: Remove duplicates
final_df = final_df.drop_duplicates()

# 🚀 STEP 10: Drop rows with missing values (safety)
final_df = final_df.dropna()

# 🚀 STEP 11: Validate dataset
print("\nData Validation:")
print("States:", final_df["state_name"].nunique())
print("Districts:", final_df["district_name"].nunique())
print("Subdistricts:", final_df["subdistrict_name"].nunique())
print("Villages:", final_df["village_name"].nunique())

# 🚀 STEP 12: Save final cleaned dataset
final_df.to_csv("final_village_dataset.csv", index=False)
print("✅ Saved: final_village_dataset.csv")

# 🚀 STEP 13: Create hierarchical JSON (API-ready)
data = {}

for _, row in final_df.iterrows():
    state = row["state_name"]
    district = row["district_name"]
    subdistrict = row["subdistrict_name"]
    village = row["village_name"]

    data.setdefault(state, {})
    data[state].setdefault(district, {})
    data[state][district].setdefault(subdistrict, [])

    if village not in data[state][district][subdistrict]:
        data[state][district][subdistrict].append(village)

# 🚀 STEP 14: Save JSON file
with open("village_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ Saved: village_data.json")

print("\n🎉 Data is now CLEAN + API READY!")