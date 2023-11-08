import os
import pandas as pd
from datetime import datetime

def colored_print(text, color):
    colors = {
        'green': "\033[92m",
        'yellow': "\033[93m",
        'red': "\033[91m",
        'blue': "\033[94m",
        'magenta': "\033[95m",
        'cyan': "\033[96m",
    }
    color_code = colors.get(color, colors['green'])
    reset_code = "\033[0m"
    
    print(f"{color_code}{text}{reset_code}")

def is_opr_valid(row):
    return not row['OPR'] or row['OPR'] in ["V", "M", "B", "4"]

def is_area_valid(row):
    valid_areas = ["BRO", "BR.", "GOO", "GO.", "GRO", "GR.", "MIO", "MI.", "MOO", "MO.", "VIO", "VI."]
    return not row['AREA'] or row['AREA'] in valid_areas

def is_date_valid(row):
    date = row['DATE']

    if pd.isna(date):
        return True
    
    return get_date(date) is not None

def get_date(date_text):
    possible_formats = ["%d.%m.%y", "%Y"]
    
    for date_format in possible_formats:
        try:
            parsed_date = datetime.strptime(date_text, date_format)
            return parsed_date
        except ValueError:
            pass
    
    return None

def is_location_valid(row):
    ozin = row['OZIN']
    ozie = row['OZIE']
    
    if pd.isna(ozin) and pd.isna(ozie):
        return True
    
    try:
        latitude = float(ozin)
        longitude = float(ozie)
        return 51 < latitude < 57 and 23 < longitude < 33
    except:
        return False

def check_row_validity(row):
    errors = []
    
    if not is_opr_valid(row):
        errors.append('OPERATOR')
    
    if not is_area_valid(row):
        errors.append('AREA')
    
    if not is_date_valid(row):
        errors.append('DATE')
    
    if not is_location_valid(row):
        errors.append('LOCATION')
        
    return errors

def main():
    dir_path = './../csv'
    files = os.listdir(dir_path)

    for file in files:
        colored_print(f"----- {file} -----", "green")

        file_path = os.path.join(dir_path, file)
        try:
            df = pd.read_csv(
                file_path,
                delimiter=';',
                skip_blank_lines=True,
                comment='/',
                quoting=3,
                skipinitialspace=True,
                header=0,
                dtype=str
            )
        except pd.errors.ParserError as e:
            colored_print(f"Error parsing file: {e}", "red")
            continue
    
        expected_columns_count = len(df.columns)
        if expected_columns_count != 22:
            colored_print("Columns count != 22", "red")
            continue

        df.columns = df.columns.str.strip()
        df = df.map(lambda x: x.strip() if isinstance(x, str) else x)

        for i, row in df.iterrows():
            errors = check_row_validity(row)
            if errors:
                colored_print(f"{i + 1}: {', '.join(errors)}", "red" if 'OPERATOR' in errors else "yellow")
                print(dict(row))

if __name__ == "__main__":
    main()
