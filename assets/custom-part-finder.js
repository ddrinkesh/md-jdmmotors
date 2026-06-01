(function () {
  'use strict';

  if (typeof window.PartFinder !== 'undefined') return;

  window.PartFinder = class PartFinder {

    constructor(config) {
      this.sectionId     = config.sectionId;
      this.collectionUrl = config.collectionUrl;

      const root = document.querySelector('[data-section-id="' + this.sectionId + '"]');
      if (!root) return;

      this.selBrand  = root.querySelector('select[name="brand"]');
      this.selModel  = root.querySelector('select[name="model"]');
      this.selYear   = root.querySelector('select[name="year"]');
      this.btnSubmit = root.querySelector('.part-finder__btn');

      if (!this.selBrand || !this.selModel || !this.selYear || !this.btnSubmit) return;

      this.brandModels = new Map();
      this.modelYears  = new Map();
      this.allBrands   = new Set();

      for (const rec of config.data) {
        const { brand, model, year } = rec;
        if (!brand) continue;

        this.allBrands.add(brand);

        if (!this.brandModels.has(brand)) this.brandModels.set(brand, new Set());
        if (model) this.brandModels.get(brand).add(model);

        if (model && year) {
          const key = brand + '::' + model;
          if (!this.modelYears.has(key)) this.modelYears.set(key, new Set());
          this.modelYears.get(key).add(year);
        }
      }

      this.placeholderBrand = this.selBrand.options[0] ? this.selBrand.options[0].text : 'Brand';
      this.placeholderModel = this.selModel.options[0] ? this.selModel.options[0].text : 'Model';
      this.placeholderYear  = this.selYear.options[0]  ? this.selYear.options[0].text  : 'Year';

      this._populateBrands();
      this._setDisabled(this.selModel, true);
      this._setDisabled(this.selYear,  true);
      this._updateButton();
      this._bindEvents();
    }

    _setDisabled(sel, state) {
      sel.disabled = state;
      sel.setAttribute('aria-disabled', String(state));
    }

    _fillSelect(sel, placeholder, values, disabled) {
      sel.innerHTML = '';
      const ph = document.createElement('option');
      ph.value       = '';
      ph.disabled    = true;
      ph.selected    = true;
      ph.textContent = placeholder;
      sel.appendChild(ph);

      for (const val of values) {
        const opt = document.createElement('option');
        opt.value = opt.textContent = val;
        sel.appendChild(opt);
      }

      sel.selectedIndex = 0;
      this._setDisabled(sel, disabled);
    }

    _resetSelect(sel, placeholder) {
      this._fillSelect(sel, placeholder, [], true);
    }

    _updateButton() {
      const ready = !!this.selBrand.value && !!this.selModel.value && !!this.selYear.value;
      this.btnSubmit.disabled = !ready;
      this.btnSubmit.setAttribute('aria-disabled', String(!ready));
    }

    _populateBrands() {
      const sorted = [...this.allBrands].sort((a, b) => a.localeCompare(b));
      this._fillSelect(this.selBrand, this.placeholderBrand, sorted, false);
    }

    _onBrandChange() {
      this._resetSelect(this.selModel, this.placeholderModel);
      this._resetSelect(this.selYear,  this.placeholderYear);
      this._updateButton();

      const brand = this.selBrand.value;
      if (!brand) return;

      const models = [...(this.brandModels.get(brand) || [])].sort((a, b) => a.localeCompare(b));
      this._fillSelect(this.selModel, this.placeholderModel, models, false);
    }

    _onModelChange() {
      this._resetSelect(this.selYear, this.placeholderYear);
      this._updateButton();

      const brand = this.selBrand.value;
      const model = this.selModel.value;
      if (!brand || !model) return;

      const years = [...(this.modelYears.get(brand + '::' + model) || [])].sort((a, b) => Number(b) - Number(a));
      this._fillSelect(this.selYear, this.placeholderYear, years, false);
    }

    _onSubmit() {
      const brand = this.selBrand.value;
      const model = this.selModel.value;
      const year  = this.selYear.value;
      if (!brand || !model || !year) return;

      const params = new URLSearchParams();
      params.set('filter.p.m.custom.brands', brand.trim());
      params.set('filter.p.m.custom.model',  model.trim());
      params.set('filter.p.m.custom.year',   year.trim());

      window.location.href = this.collectionUrl + '?' + params.toString();
    }

    _bindEvents() {
      this.selBrand.addEventListener('change', () => this._onBrandChange());
      this.selModel.addEventListener('change', () => this._onModelChange());
      this.selYear.addEventListener('change',  () => this._updateButton());
      this.btnSubmit.addEventListener('click', () => this._onSubmit());
    }
  };

})();
