#!/bin/bash
# ============================================================
#  IoT Red Team Lab — Tek Tuşla Dağıtım Scripti
#  5 Lab, 5 Docker Container, Sıfır Konfigürasyon
# ============================================================

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_banner() {
  echo ""
  echo -e "${CYAN}${BOLD}"
  echo "  ██████  ██████  ████████      ██       █████  ██████  "
  echo "  ██  ██  ██  ██     ██        ██      ██   ██  ██  ██ "
  echo "  ██████  ██████     ██        ██      ███████  ██████  "
  echo "  ██  ██  ██         ██        ██      ██   ██  ██  ██ "
  echo "  ██  ██  ██         ██        ██████  ██   ██  ██████  "
  echo ""
  echo -e "       Akıllı Ev IoT Red Team Lab — Eğitim Ortamı${NC}"
  echo ""
}

print_lab() {
  echo -e "${YELLOW}  [$1/5]${NC} $2"
}

check_docker() {
  if ! command -v docker &> /dev/null; then
    echo -e "${RED}HATA: Docker bulunamadı.${NC}"
    echo "  Lütfen Docker'ı yükle: https://docs.docker.com/get-docker/"
    exit 1
  fi
  echo -e "${GREEN}✓ Docker bulundu:${NC} $(docker --version | head -1)"
}

stop_existing() {
  echo ""
  echo -e "${YELLOW}► Mevcut container'lar durduruluyor...${NC}"
  for name in lab1-camera lab2-thermostat lab3-bulb lab4-lock lab5-evil-twin; do
    if docker ps -a --format '{{.Names}}' | grep -q "^${name}$"; then
      docker rm -f "$name" > /dev/null 2>&1 && echo -e "  ${RED}✗${NC} $name durduruldu"
    fi
  done
}

build_lab() {
  local num=$1
  local name=$2
  local dir=$3

  print_lab "$num" "${BOLD}$name${NC} build ediliyor..."
  if [ ! -d "$SCRIPT_DIR/$dir" ]; then
    echo -e "  ${RED}HATA: $dir klasörü bulunamadı!${NC}"
    return 1
  fi
  docker build -t "$name" "$SCRIPT_DIR/$dir" -q && \
    echo -e "  ${GREEN}✓ Build tamamlandı${NC}" || \
    { echo -e "  ${RED}✗ Build başarısız!${NC}"; return 1; }
}

run_lab() {
  local name=$1
  shift
  docker run -d --name "$name" "$@" "$name" > /dev/null && \
    echo -e "  ${GREEN}✓ Container başlatıldı${NC}" || \
    { echo -e "  ${RED}✗ Container başlatılamadı!${NC}"; return 1; }
}

ACTION=${1:-"start"}

case "$ACTION" in

  start|"")
    print_banner
    check_docker
    stop_existing

    echo ""
    echo -e "${CYAN}${BOLD}► Build & Run aşaması başlıyor...${NC}"
    echo ""

    # LAB 1
    build_lab 1 "lab1-camera" "lab1-camera"
    run_lab "lab1-camera" -p 8081:8081 -p 8554:8554

    # LAB 2
    build_lab 2 "lab2-thermostat" "lab2-thermostat"
    run_lab "lab2-thermostat" -p 8082:8082 -p 2323:2323

    # LAB 3
    build_lab 3 "lab3-bulb" "lab3-bulb"
    run_lab "lab3-bulb" -p 8083:8083 -p 1883:1883

    # LAB 4
    build_lab 4 "lab4-lock" "lab4-lock"
    run_lab "lab4-lock" -p 8084:8084 -p 9001:9001

    # LAB 5
    build_lab 5 "lab5-evil-twin" "lab5-evil-twin"
    run_lab "lab5-evil-twin" -p 8085:8085

    echo ""
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${BOLD}  ✓ TÜM LABLAR HAZIR!${NC}"
    echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${BOLD}Lab 1${NC} — 📷 IP Kamera        ${CYAN}http://localhost:8081${NC}"
    echo -e "            Giriş: ${YELLOW}admin / 123456${NC}"
    echo ""
    echo -e "  ${BOLD}Lab 2${NC} — 🌡  Termostat        ${CYAN}http://localhost:8082${NC}"
    echo -e "            Telnet: ${YELLOW}nc localhost 2323${NC} (support/support)"
    echo ""
    echo -e "  ${BOLD}Lab 3${NC} — 💡 Akıllı Ampul      ${CYAN}http://localhost:8083${NC}"
    echo -e "            MQTT Port: ${YELLOW}1883 (anonim açık)${NC}"
    echo ""
    echo -e "  ${BOLD}Lab 4${NC} — 🔐 Akıllı Kilit      ${CYAN}http://localhost:8084${NC}"
    echo -e "            BLE Port: ${YELLOW}9001 (şifresiz)${NC}"
    echo ""
    echo -e "  ${BOLD}Lab 5${NC} — 📡 Evil Twin WiFi    ${CYAN}http://localhost:8085${NC}"
    echo ""
    echo -e "  ${YELLOW}Log izlemek için:${NC} ./deploy.sh logs <lab-adi>"
    echo -e "  ${YELLOW}Durdurmak için:${NC}  ./deploy.sh stop"
    echo ""
    ;;

  stop)
    echo -e "${YELLOW}► Tüm lablar durduruluyor...${NC}"
    for name in lab1-camera lab2-thermostat lab3-bulb lab4-lock lab5-evil-twin; do
      docker rm -f "$name" > /dev/null 2>&1 && \
        echo -e "  ${RED}✗${NC} $name durduruldu" || true
    done
    echo -e "${GREEN}✓ Tümü durduruldu.${NC}"
    ;;

  logs)
    LAB=${2:-"lab1-camera"}
    echo -e "${CYAN}► $LAB logları izleniyor (Ctrl+C ile çık)...${NC}"
    docker logs -f "$LAB"
    ;;

  status)
    echo ""
    echo -e "${BOLD}Container Durumları:${NC}"
    echo ""
    for name in lab1-camera lab2-thermostat lab3-bulb lab4-lock lab5-evil-twin; do
      STATUS=$(docker ps --format '{{.Names}} {{.Status}}' | grep "^$name " | awk '{print $2, $3, $4}')
      if [ -n "$STATUS" ]; then
        echo -e "  ${GREEN}✓ ÇALIŞIYOR${NC} — $name ($STATUS)"
      else
        echo -e "  ${RED}✗ DURDURULDU${NC} — $name"
      fi
    done
    echo ""
    ;;

  rebuild)
    echo -e "${YELLOW}► Sıfırdan yeniden build ediliyor...${NC}"
    "$0" stop
    "$0" start
    ;;

  help|*)
    echo ""
    echo -e "${BOLD}Kullanım:${NC}"
    echo "  ./deploy.sh start      — Tüm labları başlat (varsayılan)"
    echo "  ./deploy.sh stop       — Tüm labları durdur"
    echo "  ./deploy.sh status     — Container durumlarını göster"
    echo "  ./deploy.sh logs LAB   — Lab loglarını izle"
    echo "  ./deploy.sh rebuild    — Sıfırdan yeniden kur"
    echo ""
    echo -e "${BOLD}Lab İsimleri:${NC}"
    echo "  lab1-camera | lab2-thermostat | lab3-bulb | lab4-lock | lab5-evil-twin"
    echo ""
    ;;
esac
