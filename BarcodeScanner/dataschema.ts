export const dataExample = {
    "Cameras": [
        {
            "Key": "1",
            "Value": "One"
        }
    ]
}

export const dataSchema = {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
        "Cameras": {
            "type": "array",
            "items":
            {
                "type": "object",
                "properties": {
                    "Key": {
                        "type": "string"
                    },
                    "Value": {
                        "type": "string"
                    }
                }
            }
        }
    }
};