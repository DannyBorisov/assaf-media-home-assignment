<?php

function send_otp_email($to, $otp)
{
    $headers = [
        "Content-Type: application/json",
        "Accept: application/json",
        "api-key: " . getenv('BREVO_API_KEY')
    ];

    $body = [
        "sender" => [
            "name" => 'Assaf Media',
            "email" => $GLOBALS['SUPPORT_EMAIL']
        ],
        "to" => [
            [
                "name" => $to["username"],
                "email" => $to["email"]
            ]
        ],
        "subject" => "Your OTP Code",
        "textContent" => "Your OTP code is: $otp"
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.brevo.com/v3/smtp/email");
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($body));

    $response = curl_exec($ch);
    if (curl_errno($ch)) {
        error_log("" . curl_error($ch));
        echo json_encode(false);
        die();
    }

    curl_close($ch);
    return json_decode($response, true);
}


function generateUuidV4()
{
    $data = random_bytes(16);

    // Set version to 0100
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    // Set bits 6-7 to 10
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}
?>