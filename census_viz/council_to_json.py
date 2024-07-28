# import pandas as pd

# # Load the provided Excel file
# file_path = 'census_data_citycouncil.xlsx'
# data = pd.read_excel(file_path)

# # Create a dictionary mapping GEOID to CITYCOUNCIL_ID
# geo_to_council = data[['GEOID', 'CITYCOUNCIL_ID']].dropna().set_index('GEOID').to_dict()['CITYCOUNCIL_ID']

# # Save the dictionary to a JSON file for use in the visualization
# import json

# with open('geo_to_council.json', 'w') as f:
#     json.dump(geo_to_council, f)
