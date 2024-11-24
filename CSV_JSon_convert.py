import json

# Load the JSON Lines file
input_path = 'movies.json'  # Update this to your file's location
output_path = 'movies_fixed.json'  # New file with fixed format

with open(input_path, 'r') as infile:
    data = [json.loads(line) for line in infile]

# Save as a standard JSON array
with open(output_path, 'w') as outfile:
    json.dump(data, outfile, indent=4)

print("Fixed JSON saved as movies_fixed.json")