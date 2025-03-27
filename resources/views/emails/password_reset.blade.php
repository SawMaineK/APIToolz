<!DOCTYPE html>
<html>
<head>
    <title>Reset Your Password</title>
</head>
<body>
    <p>Hi {{ $user->name }},</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="{{ $resetLink }}">{{ $resetLink }}</a></p>
    <p>If you did not request this, please ignore this email.</p>
</body>
</html>
