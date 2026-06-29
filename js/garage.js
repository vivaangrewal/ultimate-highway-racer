import { VEHICLE_CATALOG, GARAGE_DEFAULTS } from './constants.js';

export class Garage {
  constructor(save) {
    this.save = save;
    this.data = this.save.getGarage() || { owned: [...GARAGE_DEFAULTS.owned], selected: GARAGE_DEFAULTS.selected };
  }

  getOwned() { return this.data.owned; }
  getSelected() { return this.data.selected; }

  getVehicle(id) { return VEHICLE_CATALOG.find(v => v.id === id); }
  getSelectedVehicle() { return this.getVehicle(this.data.selected); }

  isOwned(id) { return this.data.owned.includes(id); }

  buy(id) {
    const v = this.getVehicle(id);
    if (!v || this.isOwned(id)) return false;
    const coins = this.save.getTotalCoins();
    if (coins < v.price) return false;
    this.save.addCoins(-v.price);
    this.data.owned.push(id);
    this.save.saveGarage(this.data);
    return true;
  }

  select(id) {
    if (!this.isOwned(id)) return false;
    this.data.selected = id;
    this.save.saveGarage(this.data);
    return true;
  }

  getByCategory(cat) {
    return VEHICLE_CATALOG.filter(v => v.cat === cat);
  }
}
