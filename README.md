# ⏲️ Firebase Remote Config Scheduler API

A Node.js application to schedule updates for firebase remote config parameters. Schedule updates at specific scheduled date & time or schedule the changes for a specific period with the help of starting and ending date & times.

## 💻 Install

1. **Install dependencies:**
    ```bash
    npm install
    ```

2. **Add your Firebase Admin SDK service account key:**
    - Download the `service-account-key.json` file from Firebase Console.
    - Place the `service-account-key.json` file in the root directory of your project.
3. **Start the server:**
    ```bash
    npm start
    ```

## 🪴 Usage
- **API Endpoints:**
    - **Fetch Config Template**
       - **URL:** `/template`
       - **Method:** `GET`
    - **Add Config Parameter**
       - **URL:** `/add`
       - **Method:** `POST`
       - **Request Body:**
        ```json
        {
            "key": "KEY", // MANDATORY
            "defaultValue": "VALUE", // MANDATORY - JSON values also should be converted to string
            "description": "", // NOT MANDATORY
            "conditionalValues": {
                "conditionName": {
                    "value": "VALUE"
                }
            }, // NOT MANDATORY - Conditions must be created from console beforehand
            "valueType": "STRING|NUMBER|BOOLEAN|JSON" // NOT MANDATORY - Defaults to STRING
        }
        ```
    - **Schedule Publish:**
        - **URL:** `/publish`
        - **Method:** `POST`
        - **Cases:** 
          - None of the startDate, endDate or scheduledDate is passed, the update will be published immediately. 
          - scheduledDate is passed, the update will be scheduled at that date for publishing. 
          - startDate & endDate is passed the update will be scheduled at the starting date and will be scheduled to be reverted back at the ending date.
        - **Request Body:**
        ```json
        {
            "startDate": "2024-07-17T10:30:00+05:30", // NOT MANDATORY - Must be in ISO format
            "endDate": "2024-07-18T10:30:00+05:30", // NOT MANDATORY - Must be in ISO format
            "scheduleDate": "2024-07-18T10:30:00+05:30", // NOT MANDATORY - Must be in ISO format
            "key": "KEY", // MANDATORY - Must be an exisiting key
            "defaultValue": "{\"KEY\":\"VALUE\"}", // MANDATORY - JSON values also should be converted to string
            "conditionalValues": {
                "conditionName": {
                    "value": "{\"KEY\":\"CONDITIONAL VALUE\"}"
                }
            }, // NOT MANDATORY - Conditions must be created from console beforehand
            "valueType": "STRING|NUMBER|BOOLEAN|JSON" // NOT MANDATORY - Defaults to existing type
        }
        ```

## 🤝 Contributing

Contributions are welcome! Please fork the repository and use a feature branch. Pull requests will be reviewed actively.

## ❤ Feedback

For any questions or feedback, please reach out to avishekdas128@gmail.com. Give a ⭐️ if this project helped you!
