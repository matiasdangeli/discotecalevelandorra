<?php
declare(strict_types=1);
date_default_timezone_set('Europe/Andorra');
session_start();

$dataFile = __DIR__ . '/../assets/data/events.json';
$uploadDir = __DIR__ . '/../assets/img/events';
$passwordFile = __DIR__ . '/.admin-password';

function h(string $value): string { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
function readEvents(string $path): array {
  if (!is_file($path)) return [];
  $data = json_decode((string) file_get_contents($path), true);
  return is_array($data) ? $data : [];
}
function saveEvents(string $path, array $events): void {
  usort($events, fn($a,$b) => strcmp(($a['date'] ?? '').($a['startTime'] ?? ''), ($b['date'] ?? '').($b['startTime'] ?? '')));
  $tmp = $path . '.tmp';
  file_put_contents($tmp, json_encode(array_values($events), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n", LOCK_EX);
  rename($tmp, $path);
}
function weekendKey(string $date): string {
  $d = new DateTimeImmutable($date);
  $weekday = (int) $d->format('N');
  if ($weekday === 4) return $d->modify('+1 day')->format('Y-m-d');
  if ($weekday === 5) return $d->format('Y-m-d');
  if ($weekday === 6) return $d->modify('-1 day')->format('Y-m-d');
  if ($weekday === 7) return $d->modify('-2 days')->format('Y-m-d');
  return $d->format('Y-m-d');
}
function groupIsPast(array $group): bool {
  $latest = '';
  foreach ($group as $ev) $latest = max($latest, (string)($ev['endAt'] ?? (($ev['date'] ?? '') . 'T' . ($ev['endTime'] ?? '06:00'))));
  return $latest !== '' && $latest <= (new DateTimeImmutable())->format('Y-m-d\TH:i');
}

$message = '';
$error = '';

if (!is_file($passwordFile)) {
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'setup') {
    $password = (string)($_POST['password'] ?? '');
    if (strlen($password) < 10) $error = 'La contraseña debe tener al menos 10 caracteres.';
    elseif ($password !== (string)($_POST['password2'] ?? '')) $error = 'Las contraseñas no coinciden.';
    else {
      file_put_contents($passwordFile, password_hash($password, PASSWORD_DEFAULT), LOCK_EX);
      chmod($passwordFile, 0600);
      $_SESSION['level_admin'] = true;
      header('Location: ./'); exit;
    }
  }
} elseif (empty($_SESSION['level_admin'])) {
  if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'login') {
    $hash = trim((string)file_get_contents($passwordFile));
    if (password_verify((string)($_POST['password'] ?? ''), $hash)) {
      $_SESSION['level_admin'] = true;
      header('Location: ./'); exit;
    }
    $error = 'Contraseña incorrecta.';
  }
} else {
  if (($_GET['logout'] ?? '') === '1') { session_destroy(); header('Location: ./'); exit; }
  $events = readEvents($dataFile);

  if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'save') {
    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)($_POST['id'] ?? ''));
    if ($id === '') $id = bin2hex(random_bytes(6));
    $date = (string)($_POST['date'] ?? '');
    $name = trim((string)($_POST['name'] ?? ''));
    $start = (string)($_POST['startTime'] ?? '00:00');
    $end = (string)($_POST['endTime'] ?? '05:00');
    if (!$date || !$name) $error = 'Fecha y nombre son obligatorios.';
    else {
      $existing = null;
      foreach ($events as $ev) if (($ev['id'] ?? '') === $id) $existing = $ev;
      $flyer = (string)($existing['flyer'] ?? '');
      if (!empty($_FILES['flyer']['tmp_name'])) {
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0775, true);
        $mime = mime_content_type($_FILES['flyer']['tmp_name']);
        $exts = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];
        if (!isset($exts[$mime])) $error = 'El flyer debe ser JPG, PNG o WEBP.';
        elseif ((int)$_FILES['flyer']['size'] > 12582912) $error = 'El flyer supera los 12 MB.';
        else {
          $fileName = $date . '-' . $id . '.' . $exts[$mime];
          if (move_uploaded_file($_FILES['flyer']['tmp_name'], $uploadDir . '/' . $fileName)) {
            $flyer = 'assets/img/events/' . $fileName;
          } else $error = 'No se pudo guardar el flyer. Revisá los permisos de la carpeta.';
        }
      }
      if ($error === '') {
        $endDate = $date;
        if ($end <= $start) $endDate = (new DateTimeImmutable($date))->modify('+1 day')->format('Y-m-d');
        $event = [
          'id'=>$id, 'weekend'=>weekendKey($date), 'date'=>$date,
          'endAt'=>$endDate.'T'.$end, 'name'=>$name,
          'room'=>(string)($_POST['room'] ?? 'Sala Level'),
          'genre'=>trim((string)($_POST['genre'] ?? '')),
          'startTime'=>$start, 'endTime'=>$end, 'flyer'=>$flyer,
          'lineup'=>array_values(array_filter(array_map('trim', explode(',', (string)($_POST['lineup'] ?? ''))))),
          'age'=>trim((string)($_POST['age'] ?? '')),
          'entryText'=>trim((string)($_POST['entryText'] ?? '')),
          'ticketsUrl'=>trim((string)($_POST['ticketsUrl'] ?? '')),
          'whatsapp'=>preg_replace('/\D/', '', (string)($_POST['whatsapp'] ?? '')),
          '_activo'=>isset($_POST['_activo'])
        ];
        $replaced = false;
        foreach ($events as $i=>$ev) if (($ev['id'] ?? '') === $id) { $events[$i]=$event; $replaced=true; }
        if (!$replaced) $events[]=$event;
        saveEvents($dataFile,$events);
        header('Location: ./?saved=1'); exit;
      }
    }
  }

  if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'delete') {
    $id = (string)($_POST['id'] ?? '');
    $events = array_values(array_filter($events, fn($ev) => ($ev['id'] ?? '') !== $id));
    saveEvents($dataFile,$events);
    header('Location: ./?deleted=1'); exit;
  }
  if (isset($_GET['saved'])) $message='Evento guardado y publicado.';
  if (isset($_GET['deleted'])) $message='Evento eliminado.';
}
$logged = !empty($_SESSION['level_admin']);
$setup = !is_file($passwordFile);
$events = $logged ? readEvents($dataFile) : [];
$groups=[];
foreach ($events as $ev) $groups[$ev['weekend'] ?? $ev['date'] ?? 'Sin fecha'][]=$ev;
ksort($groups);
$editId=(string)($_GET['edit'] ?? '');
$editing=null;
foreach ($events as $ev) if (($ev['id'] ?? '')===$editId) $editing=$ev;
?><!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Panel · Level Andorra</title>
<style>
:root{color-scheme:dark;--bg:#07070a;--card:#141419;--line:#2b2b34;--text:#f7f7fa;--muted:#aaaab7;--gold:#ffc24b;--pink:#ff1f7a}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 80% 0,#30131f,transparent 35%),var(--bg);color:var(--text);font:15px/1.5 Inter,system-ui,sans-serif}
.wrap{width:min(1100px,calc(100% - 28px));margin:auto;padding:28px 0 70px}.top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:28px}
.logo{font-size:22px;font-weight:900;letter-spacing:.12em}.logo span{color:var(--gold)}a{color:var(--gold)}.card{background:rgba(20,20,25,.96);border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:18px}
h1,h2,h3{margin:0 0 10px;line-height:1.1}h1{font-size:clamp(28px,5vw,44px)}h2{font-size:22px}.muted{color:var(--muted)}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.full{grid-column:1/-1}label{display:block;color:var(--muted);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}
input,select,textarea{width:100%;border:1px solid var(--line);border-radius:10px;background:#09090d;color:#fff;padding:11px 12px;font:inherit}textarea{min-height:76px;resize:vertical}
button,.button{display:inline-flex;justify-content:center;align-items:center;border:0;border-radius:10px;background:linear-gradient(135deg,var(--pink),#a52cff);color:#fff;padding:11px 16px;font-weight:800;text-decoration:none;cursor:pointer}.secondary{background:#24242c}.danger{background:#4a1723}.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.notice{padding:12px 14px;border-radius:10px;background:#153c2a;color:#aaffce;margin-bottom:16px}.error{background:#4a1723;color:#ffc5d0}.event{display:grid;grid-template-columns:74px 1fr auto;gap:14px;align-items:center;padding:12px 0;border-top:1px solid var(--line)}.event img{width:74px;height:100px;object-fit:cover;border-radius:8px}.event:first-of-type{border-top:0}.event small{color:var(--muted)}.badge{display:inline-block;border:1px solid var(--line);border-radius:99px;padding:3px 8px;font-size:11px;color:var(--gold)}
details summary{cursor:pointer;font-weight:800;font-size:18px;padding:8px 0}.switch{display:flex;align-items:center;gap:8px}.switch input{width:auto}
@media(max-width:650px){.grid{grid-template-columns:1fr}.event{grid-template-columns:58px 1fr}.event img{width:58px;height:82px}.event .actions{grid-column:1/-1}.top{align-items:flex-start}.top .button{font-size:12px}}
</style></head><body><main class="wrap">
<div class="top"><div class="logo">LEVEL <span>ANDORRA</span></div><?php if($logged):?><a class="button secondary" href="?logout=1">Cerrar sesión</a><?php endif?></div>
<?php if($error):?><div class="notice error"><?=h($error)?></div><?php endif?>
<?php if($message):?><div class="notice"><?=h($message)?></div><?php endif?>

<?php if(!$logged):?>
<section class="card"><h1><?=$setup?'Crear acceso al panel':'Entrar al panel'?></h1><p class="muted"><?=$setup?'Este paso se hace una sola vez. Elegí una contraseña segura.':'Administración de Level Andorra.'?></p>
<form method="post"><input type="hidden" name="action" value="<?=$setup?'setup':'login'?>">
<div class="grid"><div class="full"><label>Contraseña</label><input type="password" name="password" required minlength="<?=$setup?'10':'1'?>"></div>
<?php if($setup):?><div class="full"><label>Repetir contraseña</label><input type="password" name="password2" required minlength="10"></div><?php endif?></div>
<div class="actions"><button type="submit"><?=$setup?'Crear panel':'Entrar'?></button></div></form></section>
<?php else:?>
<section class="card"><h1><?= $editing?'Editar evento':'Nuevo evento' ?></h1><p class="muted">Subí el flyer y completá lo que aparece escrito. Los horarios usan la hora de Andorra.</p>
<form method="post" enctype="multipart/form-data"><input type="hidden" name="action" value="save"><input type="hidden" name="id" value="<?=h((string)($editing['id']??''))?>">
<div class="grid">
<div><label>Fecha</label><input type="date" name="date" required value="<?=h((string)($editing['date']??''))?>"></div>
<div><label>Sala</label><select name="room"><option<?=($editing['room']??'')==='Sala Level'?' selected':''?>>Sala Level</option><option<?=($editing['room']??'')==='Sala Honey'?' selected':''?>>Sala Honey</option></select></div>
<div class="full"><label>Nombre de la fiesta</label><input name="name" required value="<?=h((string)($editing['name']??''))?>" placeholder="Ej: La Misa"></div>
<div><label>Desde</label><input type="time" name="startTime" value="<?=h((string)($editing['startTime']??'00:00'))?>"></div>
<div><label>Hasta</label><input type="time" name="endTime" value="<?=h((string)($editing['endTime']??'05:00'))?>"></div>
<div class="full"><label>Flyer JPG, PNG o WEBP</label><input type="file" name="flyer" accept="image/jpeg,image/png,image/webp"></div>
<div class="full"><label>Artistas, separados por coma</label><input name="lineup" value="<?=h(implode(', ',(array)($editing['lineup']??[])))?>" placeholder="DJ Uno, DJ Dos"></div>
<div><label>Estilo musical</label><input name="genre" value="<?=h((string)($editing['genre']??''))?>" placeholder="Comercial, electrónica, latino…"></div>
<div><label>Edad</label><input name="age" value="<?=h((string)($editing['age']??''))?>" placeholder="+16 / +18"></div>
<div class="full"><label>Entrada / información</label><textarea name="entryText"><?=h((string)($editing['entryText']??''))?></textarea></div>
<div><label>Enlace de entradas</label><input type="url" name="ticketsUrl" value="<?=h((string)($editing['ticketsUrl']??''))?>"></div>
<div><label>WhatsApp con prefijo</label><input name="whatsapp" value="<?=h((string)($editing['whatsapp']??'34651996088'))?>"></div>
<div class="full switch"><input type="checkbox" id="active" name="_activo" <?=($editing['_activo']??true)?'checked':''?>><label for="active" style="margin:0">Publicar este evento</label></div>
</div><div class="actions"><button type="submit">Guardar y publicar</button><?php if($editing):?><a class="button secondary" href="./">Cancelar</a><?php endif?></div></form></section>

<section class="card"><h2>Próximos fines de semana</h2>
<?php $hasFuture=false; foreach($groups as $key=>$group): if(groupIsPast($group)) continue; $hasFuture=true;?>
<details open><summary><?=h($key)?> · <?=count($group)?> evento<?=count($group)===1?'':'s'?></summary>
<?php foreach($group as $ev):?><div class="event">
<?php if(!empty($ev['flyer'])):?><img src="../<?=h($ev['flyer'])?>" alt=""><?php else:?><div></div><?php endif?>
<div><strong><?=h($ev['name']??'')?></strong><br><small><?=h($ev['date']??'')?> · <?=h($ev['startTime']??'')?>–<?=h($ev['endTime']??'')?> · <?=h($ev['room']??'')?></small><br><span class="badge"><?=!empty($ev['_activo'])?'Publicado':'Borrador'?></span></div>
<div class="actions"><a class="button secondary" href="?edit=<?=h($ev['id']??'')?>">Editar</a><form method="post" onsubmit="return confirm('¿Eliminar este evento?')"><input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?=h($ev['id']??'')?>"><button class="danger">Eliminar</button></form></div>
</div><?php endforeach?></details><?php endforeach; if(!$hasFuture):?><p class="muted">Todavía no hay próximos eventos cargados.</p><?php endif?></section>

<section class="card"><details><summary>Ediciones pasadas</summary>
<?php $hasPast=false; foreach(array_reverse($groups,true) as $key=>$group): if(!groupIsPast($group)) continue; $hasPast=true;?>
<h3><?=h($key)?></h3><?php foreach($group as $ev):?><div class="event"><div></div><div><strong><?=h($ev['name']??'')?></strong><br><small><?=h($ev['date']??'')?> · <?=h($ev['room']??'')?></small></div><div class="actions"><a class="button secondary" href="?edit=<?=h($ev['id']??'')?>">Consultar / editar</a></div></div><?php endforeach?>
<?php endforeach; if(!$hasPast):?><p class="muted">El archivo aparecerá acá automáticamente.</p><?php endif?></details></section>
<?php endif?>
</main></body></html>