import pandas as pd
import json
import os

try:
    path = 'schools.xlsx'
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        exit(1)
        
    df = pd.read_excel(path)
    
    # Print columns to help debug if needed
    print("Columns in Excel:", df.columns.tolist())
    
    # Normalize col names to lowercase for robust matching
    cols = {c.lower(): c for c in df.columns}
    
    school_col = None
    code_col = None
    
    # Heuristic for finding the right columns
    for c in cols:
        if 'school' in c and 'name' in c:
            school_col = cols[c]
        if 'center' in c and 'name' in c:
            school_col = cols[c]
        if 'center' in c and 'code' in c:
            code_col = cols[c]
            
    if not school_col:
        # Fallback simplistic search
        for c in cols:
             if 'school' in c:
                 school_col = cols[c]
                 break
    
    # If still not found, maybe it's just "Name"
    if not school_col:
         if 'name' in cols:
             school_col = cols['name']
                 
    if not code_col:
        for c in cols:
             if 'code' in c:
                 code_col = cols[c]
                 break
    
    # Try just "Center" or "Centre"
    if not code_col:
        for c in cols:
             if 'center' in c or 'centre' in c:
                 code_col = cols[c]
                 break

    if not school_col:
        print("Could not reliably identify School Name column. Please check column names.")
        exit(1)
        
    print(f"Selected School Column: {school_col}")
    print(f"Selected Code Column: {code_col}")
    
    data = []
    seen = set()
    
    for index, row in df.iterrows():
        name = str(row[school_col]).strip()
        
        # Skip empty rows
        if not name or name.lower() == 'nan':
            continue
            
        # Determine strict value/code
        if code_col:
            raw_code = str(row[code_col]).strip()
            # If code is nan or empty, fallback? 
            if not raw_code or raw_code.lower() == 'nan':
                # Use a slugified name if no code
                val = name.lower().replace(" ", "_").replace("'", "").replace(".", "")
            else:
                val = raw_code
        else:
            # Fallback to slugified name
            val = name.lower().replace(" ", "_").replace("'", "").replace(".", "")
            
        # Ensure name + val unique combination if needed, OR just list them.
        # But for dropdown, value must be unique ideally.
        
        # Let's combine name and code for display: "School Name (Code)" if code exists?
        # User asked: "list out the scholl name with center code"
        
        display_name = f"{name} ({val})" if code_col and val != name else name
        
        # Actually user wants "list out the scholl name with center code".
        # So label should probably be "Name - Code" or similar.
        
        entry = {
            "label": display_name,
            "value": val,
            "original_name": name,
            "code": val
        }
        
        if val not in seen:
            data.append(entry)
            seen.add(val)
        
    # Write to JSON
    out_dir = 'src/data'
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, 'schools.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully processed {len(data)} schools.")
    print(f"Output saved to {out_path}")
    
except Exception as e:
    print(f"Critical Error: {e}")
