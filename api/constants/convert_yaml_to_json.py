import json
import os
import sys
import uuid

import yaml


def generate_unique_id(name, description):
    """
    Generate a unique UUID (version 3) based on the app's name and description.
    This returns a string in the standard UUID format.
    """
    unique_string = f"{name}-{description}"
    return str(uuid.uuid3(uuid.NAMESPACE_DNS, unique_string))


def convert_yaml_to_recommended_apps(yaml_path, json_path, app_metadata):
    # Generate a unique ID if one is not provided.
    if not app_metadata.get("id"):
        app_metadata["id"] = generate_unique_id(
            app_metadata.get("name", "default-name"),
            app_metadata.get("description", "default-description")
        )
    
    # Read the YAML workflow file.
    with open(yaml_path, encoding='utf-8') as yf:
        workflow_data = yaml.safe_load(yf)
    
    # Re-dump the workflow data as a YAML string for storage.
    export_data_yaml = yaml.dump(workflow_data, sort_keys=False, allow_unicode=True)
    
    # Construct the app object for the recommended_apps section.
    app_object = {
        "app": {
            "id": app_metadata["id"],
            "name": app_metadata.get("name", "Whitepaper Translator"),
            "mode": app_metadata.get("mode", "advanced-chat"),
            "icon": app_metadata.get("icon", "📂"),
            "icon_background": app_metadata.get("icon_background", "#E0F2FE")
        },
        "app_id": app_metadata["id"],
        "category": app_metadata.get("category", "Web3"),
        "description": app_metadata.get("description", "A workflow to translate Web3 white papers."),
        "is_listed": True,
        "position": app_metadata.get("position", 1),
        "privacy_policy": None
    }
    
    # Initialize or load the existing recommended_apps.json.
    if os.path.exists(json_path):
        with open(json_path, encoding='utf-8') as jf:
            existing_json = json.load(jf)
    else:
        existing_json = {"recommended_apps": {}, "app_details": {}}
    
    # Ensure the recommended_apps structure for the "en-US" locale exists.
    if "recommended_apps" not in existing_json:
        existing_json["recommended_apps"] = {}
    if "en-US" not in existing_json["recommended_apps"]:
        existing_json["recommended_apps"]["en-US"] = {"categories": [], "recommended_apps": []}
    
    # Add the category to the locale (if not already present)
    category = app_metadata.get("category", "Web3")
    if category not in existing_json["recommended_apps"]["en-US"]["categories"]:
        existing_json["recommended_apps"]["en-US"]["categories"].append(category)
    
    # Append the new app object
    existing_json["recommended_apps"]["en-US"]["recommended_apps"].append(app_object)
    
    # Append or update the app_details field, including export_data.
    existing_json["app_details"][app_metadata["id"]] = {
        "export_data": export_data_yaml,
        "icon": app_metadata.get("icon", "📂"),
        "icon_background": app_metadata.get("icon_background", "#E0F2FE"),
        "id": app_metadata["id"],
        "mode": app_metadata.get("mode", "advanced-chat"),
        "name": app_metadata.get("name", "Whitepaper Translator")
    }
    
    # Write the updated JSON back to the file.
    with open(json_path, 'w', encoding='utf-8') as jf:
        json.dump(existing_json, jf, indent=4, ensure_ascii=False)
    
    print(f"Converted {yaml_path}. Updated JSON saved to {json_path}")


if __name__ == "__main__":
    # If no command-line arguments are provided, auto-convert all YAML files in the current folder.
    if len(sys.argv) == 1:
        json_file = "recommended_apps.json"
        yaml_files = [fn for fn in os.listdir('.') if fn.endswith(".yaml") or fn.endswith(".yml")]
        if not yaml_files:
            print("No YAML files found in current folder.")
        else:
            for file in yaml_files:
                # Derive metadata from the file name.
                base_name = os.path.splitext(file)[0]
                meta = {
                    "name": base_name,
                    "mode": "advanced-chat",
                    "icon": "📂",
                    "icon_background": "#E0F2FE",
                    "category": "Web3",
                    "description": f"Workflow imported from {file}",
                    "position": 1
                }
                print(f"Converting {file}...")
                convert_yaml_to_recommended_apps(file, json_file, meta)
        print("Auto conversion complete.")
    # If command-line arguments are provided, behave as before.
    elif len(sys.argv) >= 3:
        yaml_file = sys.argv[1]
        json_file = sys.argv[2]
        # Define the app metadata. If "id" is not provided, one will be auto-generated.
        meta = {
            "name": "Web3 White Paper Translator",
            "mode": "advanced-chat",
            "icon": "📂",
            "icon_background": "#E0F2FE",
            "category": "Web3",
            "description": "A workflow to translate Web3 white papers.",
            "position": 1
        }
        convert_yaml_to_recommended_apps(yaml_file, json_file, meta)
    else:
        print("Usage:")
        print("  Auto-convert all YAML files in the current folder:")
        print("    python convert_yaml_to_json.py")
        print("  Convert a single YAML file:")
        print("    python convert_yaml_to_json.py <input_yaml_file> <output_json_file>") 