export class UIManager {
  constructor() {
    this.hud = document.getElementById('hud');
    this.mainMenu = document.getElementById('main-menu');
    this.gameOverScreen = document.getElementById('game-over');
    this.pauseMenu = document.getElementById('pause-menu');
    this.garageScreen = document.getElementById('garage-screen');

    this.scoreDisplay = document.getElementById('score-display');
    this.coinDisplay = document.getElementById('coin-display');
    this.healthBar = document.getElementById('health-bar');
    this.distanceDisplay = document.getElementById('distance-display');
    this.difficultyBadge = document.getElementById('difficulty-badge');

    this.goScore = document.getElementById('go-score');
    this.goDistance = document.getElementById('go-distance');
    this.goCoins = document.getElementById('go-coins');
    this.goBest = document.getElementById('go-best');
    this.goPlayer = document.getElementById('go-player');
    this.goTopSpeed = document.getElementById('go-top-speed');

    this.usernameInput = document.getElementById('username-input');
    this.nitroBar = document.getElementById('nitro-bar');
    this.speedArc = document.getElementById('speed-arc');
    this.speedNeedle = document.getElementById('speed-needle');
    this.speedoValue = document.getElementById('speedo-value');

    this.garageGrid = document.getElementById('garage-grid');
    this.garageCoins = document.getElementById('garage-coins');
    this.gpName = document.getElementById('gp-name');
    this.gpSpeed = document.getElementById('gp-speed');
    this.gpHandling = document.getElementById('gp-handling');
    this.gpHp = document.getElementById('gp-hp');
    this.gpPrice = document.getElementById('gp-price');
    this.gpAction = document.getElementById('gp-action');

    this.selectedDifficulty = 'medium';
    this.username = 'Driver';
    this.garage = null;
    this.selectedCat = 'cars';
    this.previewVehicle = null;
    this.levelDisplay = document.getElementById('level-display');
    this.levelBanner = document.getElementById('level-banner');
    this.levelBannerText = document.getElementById('level-banner-text');
    this.weatherOverlay = document.getElementById('weather-overlay');
    this.menuCredit = document.getElementById('menu-credit');

    this.setupMenuButtons();
    this.setupDifficultySelector();
    this.setupGarage();
  }

  setGarage(garage) { this.garage = garage; }

  setupMenuButtons() {
    const bind = (id, fn) => document.getElementById(id).addEventListener('click', fn);
    bind('start-btn', () => {
      this.username = this.usernameInput.value.trim() || 'Driver';
      if (window.game) window.game.startGame(this.selectedDifficulty, this.username);
    });
    bind('pause-btn', () => { if (window.game) window.game.pauseGame(); });
    bind('restart-btn', () => { if (window.game) window.game.startGame(this.selectedDifficulty, this.username); });
    bind('menu-btn', () => { if (window.game) window.game.showMenu(); });
    bind('resume-btn', () => { if (window.game) window.game.resumeGame(); });
    bind('pause-restart-btn', () => { if (window.game) window.game.startGame(this.selectedDifficulty, this.username); });
    bind('pause-menu-btn', () => { if (window.game) window.game.showMenu(); });
    bind('garage-btn', () => this.showGarage());
    bind('garage-back', () => this.hideGarage());

    this.usernameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.username = this.usernameInput.value.trim() || 'Driver';
        if (window.game) window.game.startGame(this.selectedDifficulty, this.username);
      }
      e.stopPropagation();
    });
  }

  setupDifficultySelector() {
    const btns = document.querySelectorAll('.diff-btn');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        btns.forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedDifficulty = btn.dataset.diff;
      });
    });
  }

  setupGarage() {
    document.querySelectorAll('.g-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.g-tab').forEach((t) => t.classList.remove('selected'));
        tab.classList.add('selected');
        this.selectedCat = tab.dataset.cat;
        this.renderGarageGrid();
      });
    });
  }

  showGarage() {
    if (!this.garage) return;
    this.mainMenu.classList.add('hidden');
    this.garageScreen.classList.remove('hidden');
    this.garageCoins.textContent = `Coins: ${this.garage.save.getTotalCoins()}`;
    this.selectedCat = 'cars';
    document.querySelectorAll('.g-tab').forEach((t) => t.classList.remove('selected'));
    document.querySelector('.g-tab[data-cat="cars"]').classList.add('selected');
    this.renderGarageGrid();
    this.previewVehicle = this.garage.getSelectedVehicle();
    this.updatePreview();
  }

  hideGarage() {
    this.garageScreen.classList.add('hidden');
    this.mainMenu.classList.remove('hidden');
  }

  renderGarageGrid() {
    if (!this.garage) return;
    const vehicles = this.garage.getByCategory(this.selectedCat);
    const selected = this.garage.getSelected();
    const owned = this.garage.getOwned();
    const coins = this.garage.save.getTotalCoins();

    const icons = { bikes: '🏍', cars: '🚗', trucks: '🚛', buses: '🚌', special: '🏎' };

    this.garageGrid.innerHTML = '';
    for (const v of vehicles) {
      const isOwned = owned.includes(v.id);
      const isSelected = v.id === selected;
      const canBuy = coins >= v.price;

      const card = document.createElement('div');
      card.className = 'g-card' + (isSelected ? ' selected' : '') + (isOwned ? ' owned' : '');
      card.innerHTML = `
        <div style="position:relative">
          <div class="g-card-icon">${icons[v.cat] || '🚗'}</div>
          ${isSelected ? '<div id="g-card-selected">EQUIPPED</div>' : ''}
        </div>
        <div class="g-card-name">${v.name}</div>
        <div class="g-card-price">${isOwned ? (isSelected ? 'Equipped' : 'Owned') : v.price + ' coins'}</div>
      `;
      card.addEventListener('click', () => {
        this.previewVehicle = v;
        this.updatePreview();
        this.garageGrid.querySelectorAll('.g-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      this.garageGrid.appendChild(card);
    }
  }

  updatePreview() {
    if (!this.previewVehicle || !this.garage) return;
    const v = this.previewVehicle;
    const isOwned = this.garage.isOwned(v.id);
    const isSelected = v.id === this.garage.getSelected();

    this.gpName.textContent = v.name;
    this.gpSpeed.style.width = `${v.speed}%`;
    this.gpHandling.style.width = `${v.handling}%`;
    this.gpHp.style.width = `${v.hp}%`;
    this.garageCoins.textContent = `Coins: ${this.garage.save.getTotalCoins()}`;

    if (isSelected) {
      this.gpPrice.textContent = '';
      this.gpAction.textContent = 'EQUIPPED';
      this.gpAction.disabled = true;
      this.gpAction.style.opacity = '0.5';
    } else if (isOwned) {
      this.gpPrice.textContent = '';
      this.gpAction.textContent = 'SELECT';
      this.gpAction.disabled = false;
      this.gpAction.style.opacity = '1';
      this.gpAction.onclick = () => {
        this.garage.select(v.id);
        this.renderGarageGrid();
        this.updatePreview();
      };
    } else {
      this.gpPrice.textContent = `Price: ${v.price} coins`;
      const canBuy = this.garage.save.getTotalCoins() >= v.price;
      this.gpAction.textContent = canBuy ? 'BUY' : 'NOT ENOUGH COINS';
      this.gpAction.disabled = !canBuy;
      this.gpAction.style.opacity = canBuy ? '1' : '0.5';
      this.gpAction.onclick = canBuy ? () => {
        if (this.garage.buy(v.id)) {
          this.renderGarageGrid();
          this.updatePreview();
        }
      } : null;
    }
  }

  showHUD() { this.hideAll(); this.hud.classList.remove('hidden'); }
  showMainMenu() { this.hideAll(); this.mainMenu.classList.remove('hidden'); }
  showGameOver() { this.hideAll(); this.gameOverScreen.classList.remove('hidden'); }
  showPause() { this.pauseMenu.classList.remove('hidden'); }
  hidePause() { this.pauseMenu.classList.add('hidden'); }
  hideAll() {
    [this.hud, this.mainMenu, this.gameOverScreen, this.pauseMenu, this.garageScreen]
      .forEach((el) => el.classList.add('hidden'));
  }

  updateSpeedometer(speed, maxSpeed) {
    const pct = Math.min(speed / maxSpeed, 1.0);
    this.speedArc.setAttribute('stroke-dasharray', `${pct * 251.3} 251.3`);
    const angle = -90 + pct * 180;
    this.speedNeedle.setAttribute('transform', `rotate(${angle}, 100, 115)`);
    this.speedoValue.textContent = Math.floor(speed);
  }

  updateHUD(data) {
    this.scoreDisplay.textContent = `Score: ${data.score}`;
    this.coinDisplay.textContent = `${data.coins}`;
    this.distanceDisplay.textContent = `${Math.floor(data.distance)} m`;
    this.healthBar.style.width = `${Math.max(0, (data.health / data.maxHealth) * 100)}%`;
    this.updateSpeedometer(data.speed, data.maxSpeed);
    const nitroPct = data.nitroActive ? Math.max(0, data.nitroTimer / data.nitroMaxTimer) * 100 : 0;
    this.nitroBar.style.width = `${nitroPct}%`;
  }

  setDifficultyBadge(diff) { this.difficultyBadge.textContent = diff.toUpperCase(); }

  updateLevel(lvl) {
    if (this.levelDisplay) {
      this.levelDisplay.textContent = `LVL ${lvl.id} - ${lvl.name}`;
    }
    if (this.levelBanner && lvl.id > 1) {
      this.levelBannerText.textContent = `LEVEL ${lvl.id}: ${lvl.name.toUpperCase()}`;
      this.levelBanner.classList.remove('hidden');
      setTimeout(() => this.levelBanner.classList.add('hidden'), 2500);
    }
    if (this.weatherOverlay) {
      if (lvl.weather === 'rain') {
        this.weatherOverlay.className = 'weather-rain';
      } else if (lvl.weather === 'thunderstorm') {
        this.weatherOverlay.className = 'weather-storm';
      } else {
        this.weatherOverlay.className = '';
      }
    }
  }

  showGameOverData(data) {
    this.goPlayer.textContent = `Driver: ${data.username}`;
    this.goScore.textContent = `Score: ${data.score}`;
    this.goDistance.textContent = `Distance: ${Math.floor(data.distance)} m`;
    this.goCoins.textContent = `Coins Collected: ${data.coins}`;
    this.goTopSpeed.textContent = `Top Speed: ${Math.floor(data.topSpeed)} km/h`;
    this.goBest.textContent = `Best Score: ${data.bestScore}`;
    this.showGameOver();
  }
}
