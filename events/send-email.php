<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $to = "info@skunkworks.africa";
    $subject = "Webinar Registration";
    $message = "Name: $name\nEmail: $email";
    $headers = "From: no-reply@skunkworks.africa";

    if (mail($to, $subject, $message, $headers)) {
        echo "Registration successful. Thank you!";
    } else {
        echo "There was an error sending your registration. Please try again.";
    }
} else {
    echo "Invalid request.";
}
?>