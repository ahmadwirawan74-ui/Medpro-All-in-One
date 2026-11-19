#!/bin/bash
# Gabungkan CSS dasar (diekstrak dari gaya Flashcard Hafalan, awalan mp-) + modul MedPro → styles.css
cd "$(dirname "$0")"
cat > styles.css <<'H'
/* MedPro All In One — gaya plugin. Warna mengikuti tema Obsidian (aksen = --interactive-accent). */
H
cat css/base.css css/shell.css css/[0-9]*.css 2>/dev/null >> styles.css
wc -c styles.css
