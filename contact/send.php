<?php
/**
 * Kafred Granite & Marble — inquiry form mailer (runs on the Bluehost PHP host).
 *
 * Receives the Contact page form (POST), validates it, and emails the inquiry to
 * the shop. Responds with JSON when the page's JavaScript submits it, or with a
 * small HTML page when JavaScript is unavailable.
 *
 * To change the recipient or subject, edit the two constants below.
 */
declare(strict_types=1);

const RECIPIENT     = 'sherwingalindo18@gmail.com';
const SUBJECT       = 'KAFRED LAPIDA INQUIRY';
const SITE_NAME     = 'Kafred Granite & Marble Installation Services';
const FROM_ADDRESS  = 'noreply@kafredlapida.com';   // must be an address on this hosting domain for deliverability
const CONTACT_PAGE  = '/contact/';

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$wantsJson = stripos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false
          || strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'xmlhttprequest';

function respond(int $status, bool $ok, string $message, array $errors = []): void
{
    global $wantsJson;
    http_response_code($status);
    if ($wantsJson) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['ok' => $ok, 'message' => $message, 'errors' => $errors], JSON_UNESCAPED_UNICODE);
        exit;
    }
    header('Content-Type: text/html; charset=UTF-8');
    $title = $ok ? 'Inquiry sent' : 'Inquiry not sent';
    $safe  = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $list  = '';
    foreach ($errors as $e) { $list .= '<li>' . htmlspecialchars($e, ENT_QUOTES, 'UTF-8') . '</li>'; }
    echo "<!DOCTYPE html><html lang=\"en-PH\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
       . "<meta name=\"robots\" content=\"noindex\"><title>{$title} | " . htmlspecialchars(SITE_NAME, ENT_QUOTES, 'UTF-8') . "</title>"
       . "<style>body{margin:0;font-family:Inter,system-ui,sans-serif;background:#0B0B0B;color:#fff;display:grid;place-items:center;min-height:100vh;padding:2rem}"
       . "main{max-width:36rem}h1{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:2.4rem;margin:0 0 1rem}p,li{color:#A7A7A7;line-height:1.7}"
       . "a{color:#C5A253}.btn{display:inline-block;margin-top:1.5rem;padding:.8rem 1.4rem;background:#C5A253;color:#0B0B0B;text-decoration:none;font-weight:600;letter-spacing:.06em;text-transform:uppercase;border-radius:4px}</style></head>"
       . "<body><main><h1>{$title}</h1><p>{$safe}</p>" . ($list ? "<ul>{$list}</ul>" : '')
       . "<p>You can also call <a href=\"tel:+639530849511\">+63 953 084 9511</a> or message us on <a href=\"https://m.me/kafred.services\">Facebook Messenger</a>.</p>"
       . "<a class=\"btn\" href=\"" . CONTACT_PAGE . "\">Back to the Contact page</a></main></body></html>";
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    respond(405, false, 'This address only accepts form submissions from the Contact page.');
}

// Honeypot: real visitors never fill this hidden field.
if (trim((string)($_POST['company'] ?? '')) !== '') {
    respond(200, true, 'Thank you. Your inquiry was submitted.');
}

$clean = static function (string $v, int $max): string {
    $v = trim(preg_replace('/[\r\n\t]+/', ' ', $v) ?? '');
    return mb_substr($v, 0, $max);
};

$name    = $clean((string)($_POST['name'] ?? ''), 120);
$contact = $clean((string)($_POST['contact'] ?? ''), 160);
$service = $clean((string)($_POST['service'] ?? ''), 120);
$message = trim((string)($_POST['message'] ?? ''));
$message = mb_substr($message, 0, 4000);

$errors = [];
if ($name === '')                         { $errors[] = 'Please enter your name.'; }
if ($contact === '')                      { $errors[] = 'Please enter a phone number or email address.'; }
elseif (!preg_match('/^[+\d][\d\s().-]{6,}$/', $contact) && !filter_var($contact, FILTER_VALIDATE_EMAIL)) {
                                            $errors[] = 'Please enter a valid phone number or email address.'; }
if ($service === '')                      { $errors[] = 'Please choose the service you are asking about.'; }
if (mb_strlen($message) < 10)             { $errors[] = 'Please describe your request in a few words (at least 10 characters).'; }
if ($errors) {
    respond(422, false, 'Please correct the following and try again.', $errors);
}

$replyTo = filter_var($contact, FILTER_VALIDATE_EMAIL) ? $contact : '';
$ip      = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$when    = date('Y-m-d H:i:s T');

$body = "New inquiry from the kafredlapida.com contact form\n"
      . "==================================================\n\n"
      . "Name:            {$name}\n"
      . "Phone / Email:   {$contact}\n"
      . "Service:         {$service}\n\n"
      . "Message:\n{$message}\n\n"
      . "--------------------------------------------------\n"
      . "Sent: {$when}\nIP: {$ip}\nPage: " . CONTACT_PAGE . "\n";

$encodedFrom = '=?UTF-8?B?' . base64_encode(SITE_NAME) . '?=';
$headers = [
    'From: ' . $encodedFrom . ' <' . FROM_ADDRESS . '>',
    'Sender: ' . FROM_ADDRESS,
    'Return-Path: ' . FROM_ADDRESS,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: kafredlapida.com contact form',
];
if ($replyTo !== '') {
    $headers[] = 'Reply-To: ' . $replyTo;
}

$sent = @mail(RECIPIENT, SUBJECT, $body, implode("\r\n", $headers), '-f' . FROM_ADDRESS);

if ($sent) {
    respond(200, true, 'Thank you. Your inquiry has been sent to Kafred. We will get back to you using the contact details you provided.');
}
respond(500, false, 'Your message could not be sent right now. Please call +63 953 084 9511 or message us on Facebook Messenger.');
