<?php

define("a328763fe27bba", "TRUE");

require_once("config.php");

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


$path = $_GET["path"] ?? null;
$globals["_GET_DATA"] = $path;

#endregion start

switch ($path) {
    case 'login':
        $username = $_GET["username"] ?? null;
        $honeyPot = $_GET["honeyPot"] ?? null;

        if (!$username) {
            error_log("LOGIN ERROR: No username provided");
            echo json_encode(false);
            die();
        }

        if ($honeyPot) {
            error_log("LOGIN ERROR: BOT alert! honeypot triggered for user $username");
            echo json_encode(false);
            die();
        }


        $user_otp = mysql_fetch_array("SELECT otp FROM otp WHERE username = ? LIMIT 1", [$username]);
        if (!empty($user_otp)) {
            $otp_data = json_decode($user_otp[0]);
            if ((time() - $otp_data['created_at']) < 30) {
                error_log("LOGIN ERROR: OTP was requested too recently for user
    $username");
                echo json_encode(["success" => false, "message" => "please try again soon"]);
                die();
            }
        }

        $fetch_user_query = "SELECT * FROM users WHERE username = ? LIMIT 1";
        $user_results = mysql_fetch_array($fetch_user_query, [$username]);

        if (empty($user_results)) {
            error_log("LOGIN ERROR: User not found - $username");
            echo json_encode(false);
            die();
        }


        $otp = rand(100000, 999999);
        $otp_results = mysql_insert("otp", [
            "username" => $username,
            "otp" => $otp,
            "expires_at" => date("Y-m-d H:i:s", strtotime("+10 minutes"))
        ]);


        if (!$otp_results["success"]) {
            error_log("LOGIN ERROR: Failed to insert OTP for user $username");
            echo json_encode(false);
            die();
        }

        send_otp_email($username, $otp);
        echo json_encode(["success" => true, "message" => "OTP sent to $username"]);
        die();


    case 'verify_otp':
        $username = $_POST["username"] ?? null;
        $otp = $_POST["otp"] ?? null;

        if (!$username || !$otp) {
            error_log("VERIFY OTP ERROR: Missing username or otp");
            echo json_encode(["success" => false, "message" => "Missing username or otp"]);
            die();
        }

        $user_otp = mysql_fetch_array("SELECT otp, expires_at FROM otp WHERE username = ? ORDER BY id DESC LIMIT 1", [$username]);
        if (empty($user_otp)) {
            error_log("VERIFY OTP ERROR: No OTP found for user $username");
            echo json_encode(["success" => false, "message" => "OTP not found"]);
            die();
        }

        $stored_otp = $user_otp[0]['otp'];
        $expires_at = strtotime($user_otp[0]['expires_at']);

        if ($otp != $stored_otp) {
            error_log("VERIFY OTP ERROR: Invalid OTP for user $username");
            echo json_encode(["success" => false, "message" => "Invalid OTP"]);
            die();
        }

        if (time() > $expires_at) {
            error_log("VERIFY OTP ERROR: OTP expired for user $username");
            echo json_encode(["success" => false, "message" => "OTP expired"]);
            die();
        }

        $token = generateUuidV4();
        echo $token;

        break;

}

include_all_plugins("auth.php");
?>