<?php

$username = $_POST['username'] ?? "";
$password = $_POST['password'] ?? "";

echo "Hallo,  " . $_POST['username'] . "<br> <br>";
echo "Dein Passwort ist:  " . $_POST['password'];

if($username == "login@admin.com" && $password == "geheim") {
echo "Du hast dich erfolgreich eingeloggt!";
}
else {
    echo "Falscher Benutzername oder Passwort!";
}