$Date = Get-Date -Format "yyyy-MM-dd"
$DbPath = "D:\ABGYM\Backend\prisma\dev.db"
$LocalBackupDir = "D:\ABGYM\Backend\backups"
$BackupFile = "$LocalBackupDir\gym_$Date.db"
$Remote = "gdrive:Gym-DB-Backups"

if (!(Test-Path $LocalBackupDir)) {
    New-Item -ItemType Directory -Path $LocalBackupDir
}

sqlite3 $DbPath ".backup '$BackupFile'"

rclone copy $LocalBackupDir $Remote --ignore-existing --log-file="$LocalBackupDir\rclone.log"

Get-ChildItem $LocalBackupDir -Filter "*.db" |
Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
Remove-Item
