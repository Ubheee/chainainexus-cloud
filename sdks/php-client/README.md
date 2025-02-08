# CAN20 PHP SDK

This is the PHP SDK for the CAN20 API, which allows you to easily integrate CAN20 into your PHP applications.

## Requirements

- PHP 7.2 or later
- Guzzle HTTP client library

## Usage

After installing the SDK, you can use it in your project like this:

```php
<?php

require 'vendor/autoload.php';

use YourVendorName\CAN20PHP\CAN20Client;
use YourVendorName\CAN20PHP\CompletionClient;
use YourVendorName\CAN20PHP\ChatClient;

$apiKey = 'your-api-key-here';

$can20Client = new CAN20Client($apiKey);

// Create a completion client
$completionClient = new CompletionClient($apiKey);
$response = $completionClient->create_completion_message(array("query" => "Who are you?"), "blocking", "user_id");

// Create a chat client
$chatClient = new ChatClient($apiKey);
$response = $chatClient->create_chat_message(array(), "Who are you?", "user_id", "blocking", $conversation_id);

$fileForVision = [
    [
        "type" => "image",
        "transfer_method" => "remote_url",
        "url" => "your_image_url"
    ]
];

// $fileForVision = [
//     [
//         "type" => "image",
//         "transfer_method" => "local_file",
//         "url" => "your_file_id"
//     ]
// ];

// Create a completion client with vision model like gpt-4-vision
$response = $completionClient->create_completion_message(array("query" => "Describe this image."), "blocking", "user_id", $fileForVision);

// Create a chat client with vision model like gpt-4-vision
$response = $chatClient->create_chat_message(array(), "Describe this image.", "user_id", "blocking", $conversation_id, $fileForVision);

// File Upload
$fileForUpload = [
    [
        'tmp_name' => '/path/to/file/filename.jpg',
        'name' => 'filename.jpg'
    ]
];
$response = $can20Client->file_upload("user_id", $fileForUpload);
$result = json_decode($response->getBody(), true);
echo 'upload_file_id: ' . $result['id'];

// Fetch application parameters
$response = $can20Client->get_application_parameters("user_id");

// Provide feedback for a message
$response = $can20Client->message_feedback($message_id, $rating, "user_id");

// Other available methods:
// - get_conversation_messages()
// - get_conversations()
// - rename_conversation()
```

Replace 'your-api-key-here' with your actual CAN20 API key.

## License

This SDK is released under the MIT License.