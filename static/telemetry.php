<?php
$method = 'POST';
require './.check_request.php';

$post = json_decode(file_get_contents('php://input'));
$required = [
    'id',
    'game',
    'police',
    'name',
    'uid',
    'version',
    'data',
    'flag'
];
$result = [];
$data = [];
foreach($required as $key) {
    if (!isset($post->$key) || ($post->$key && empty($post->$key))) http_response_code(403) && die(json_encode(['Access denied!']));
    $data[$key] = $post->$key;
}
$data['data'] = json_encode($data['data']);

if (!isset($USER_KEY) || $data['id'] != $USER_KEY) http_response_code(403) && die(json_encode(['Access denied!']));

$MYSQLI = new mysqli($db_url, $db_user, $db_pass, $db_name);
if ($MYSQLI->connect_errno) {
    die(json_encode(['Failed to connect to MySQL!']));
}

$userscript_version = '4.0.0';
if (isset($post->userscript_version)) $userscript_version = $post->userscript_version;

if ($USER == null) {
    if (!($insert = $MYSQLI->prepare('INSERT INTO `v4_user`(`id`, `game`, `uid`, `version`, `name`, `data`, `police`, `userscript_version`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'))) {
        die(json_encode(['Preparing Statement failed!']));
    }
    $insert->bind_param('ssisssis', $USER_KEY, $data['game'], $data['uid'], $data['version'], $data['name'], $data['data'], $data['police'], $userscript_version);
    if (!$insert->execute()) {
        die(json_encode(['Execute failed!', $insert->error]));
    }
    $insert->close();

//    $data['data'] = json_decode($data['data']);
//    $webhook_body = json_encode([
//        'embeds' => [
//            [
//                'author' => [
//                    'name' => 'LSS-Manager V.4',
//                ],
//                'title' => '**New Telemetry Entry** '.$data['flag'],
//                'color' => 13185068,
//                'description' => '**[*'.$data['uid'].'*]**: '.$data['name']."\n".
//                    '**Version**: '.$data['version']."\n".
//                    '**Broswer**: '.$data['data']->browser."\n".
//                    '**Buildings**: '.$data['data']->buildings."\n".
//                    "**Modules**: ```md\n* ".join("\n* ", $data['data']->modules).'```',
//                'timestamp' => date(DATE_ATOM)
//            ]
//        ]
//    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
//    require './utils/webhook.php';
//    $webhook_response = webhook($webhook_body, $configs->discord_webhook_url);
//
//    $result['success'] = $webhook_response == '';
    $result['success'] = true;
} else {
    if (!($update = $MYSQLI->prepare('UPDATE `v4_user` SET `name`=?, `version`=?, `data`=?, `timestamp`=CURRENT_TIMESTAMP(), `police`=?, `userscript_version`=? WHERE `id`=?'))) {
        die(json_encode(['Preparing Statement failed!']));
    }
    $update->bind_param('sssiss', $data['name'], $data['version'], $data['data'], $data['police'], $userscript_version, $USER_KEY);
    if (!$update->execute()) {
        // die(json_encode($MYSQLI->error));
	    die(json_encode(['Execute failed!']));
    }
    $update->close();
    $result['success'] = true;
}

echo json_encode($result);
