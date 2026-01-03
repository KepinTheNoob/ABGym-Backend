# -------- CONFIG --------
$Date = Get-Date -Format "yyyy-MM-dd"
$DbPath = "C:\Users\Kevin\Documents\Gym\Backend\prisma\dev.db"
$LocalBackupDir = "C:\Users\Kevin\Documents\Gym\Backend\backups"
$BackupFile = "$LocalBackupDir\gym_$Date.db"
$Remote = "gdrive:Gym-DB-Backups"

# -------- ENSURE DIR EXISTS --------
if (!(Test-Path $LocalBackupDir)) {
    New-Item -ItemType Directory -Path $LocalBackupDir
}

# -------- SQLITE SAFE BACKUP --------
sqlite3 $DbPath ".backup '$BackupFile'"

# -------- UPLOAD TO GOOGLE DRIVE --------
rclone copy $LocalBackupDir $Remote --ignore-existing --log-file="$LocalBackupDir\rclone.log"

# -------- KEEP LAST 30 DAYS --------
Get-ChildItem $LocalBackupDir -Filter "*.db" |
Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
Remove-Item
