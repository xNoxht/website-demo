(function(){
  const defaultState = {
    resources: {gold: 50, food: 50, wood: 20, iron: 10},
    units: {infantry: 0, archers: 0, cavalry: 0, siege: 0},
    buildings: {hq:1, barracks:1, forge:1, farm:1, mine:1},
    prestige: 0,
    lastUpdate: Date.now(),
    nextBattle: Date.now() + 3600*1000,
    log: []
  };

  function load(){
    const raw = localStorage.getItem('armyGame');
    if(raw){
      try{ return JSON.parse(raw); }catch(e){ }
    }
    return {...defaultState};
  }

  let state = load();

  function save(){
    localStorage.setItem('armyGame', JSON.stringify(state));
  }

  function addLog(msg){
    state.log.unshift({t:Date.now(),m:msg});
    if(state.log.length>50) state.log.pop();
  }

  function format(num){ return Math.floor(num); }

  function updateUI(){
    const res = $('#resources').empty();
    for(const k in state.resources){
      res.append(`<span>${k}: ${format(state.resources[k])}</span>`);
    }

    const b = $('#buildings').empty();
    const buildings = {
      hq:'Headquarters',
      barracks:'Barracks',
      forge:'Forge',
      farm:'Farm',
      mine:'Mine'
    };
    for(const key in buildings){
      const lvl = state.buildings[key];
      b.append(`<li>${buildings[key]} Lv ${lvl} <button data-upgrade="${key}">Upgrade</button></li>`);
    }

    const r = $('#recruit').empty();
    const units = {
      infantry:'Infantry',
      archers:'Archers',
      cavalry:'Cavalry',
      siege:'Siege'
    };
    for(const key in units){
      const count = state.units[key];
      r.append(`<li>${units[key]} (${count}) <button data-unit="${key}">Recruit</button></li>`);
    }

    const log = $('#log').empty();
    state.log.forEach(l=>{
      const d = new Date(l.t).toLocaleTimeString();
      log.append(`<li>[${d}] ${l.m}</li>`);
    });
  }

  function getMult(){ return 1 + state.prestige * 0.1; }

  function tick(dt){
    const mult = getMult();
    state.resources.gold += dt * 0.5 * state.buildings.hq * mult;
    state.resources.food += dt * 0.3 * state.buildings.farm * mult;
    state.resources.wood += dt * 0.2 * state.buildings.mine * mult;
    state.resources.iron += dt * 0.1 * state.buildings.mine * mult;

    if(Date.now()>=state.nextBattle){
      battle();
      state.nextBattle += 3600*1000;
    }
  }

  function costUpgrade(building){
    const lvl = state.buildings[building];
    return {
      gold: 20*lvl,
      wood: 10*lvl,
      iron: 5*lvl
    };
  }

  function canAfford(cost){
    for(const k in cost){ if(state.resources[k]<cost[k]) return false; }
    return true;
  }

  function pay(cost){ for(const k in cost) state.resources[k]-=cost[k]; }

  function upgrade(building){
    const c = costUpgrade(building);
    if(canAfford(c)){
      pay(c);
      state.buildings[building]++;
      addLog(`Upgraded ${building}`);
    } else addLog('Not enough resources');
  }

  function costRecruit(unit){
    switch(unit){
      case 'infantry': return {gold:10, food:5};
      case 'archers': return {gold:15, food:5, wood:5};
      case 'cavalry': return {gold:30, food:10};
      case 'siege': return {gold:50, food:20, wood:10, iron:10};
    }
  }

  function recruit(unit){
    const c = costRecruit(unit);
    if(canAfford(c)){
      pay(c);
      state.units[unit]++;
      addLog(`Recruited ${unit}`);
    } else addLog('Not enough resources');
  }

  function power(){
    return state.units.infantry*1 + state.units.archers*2 + state.units.cavalry*3 + state.units.siege*5;
  }

  function battle(){
    const enemy = 20 + state.prestige*10;
    const myPow = power() * (1+ state.buildings.forge*0.1);
    if(myPow >= enemy){
      addLog('Victory! Looted 30 gold');
      state.resources.gold += 30 * getMult();
    } else {
      addLog('Defeat...');
    }
  }

  function prestige(){
    if(confirm('Restart and gain prestige?')){
      state = {...defaultState, prestige: state.prestige+1};
      addLog('Prestiged!');
      save();
    }
  }

  $(document).on('click','button[data-upgrade]',e=>{
    const b = $(e.target).data('upgrade');
    upgrade(b);
    updateUI();
  });
  $(document).on('click','button[data-unit]',e=>{
    const u = $(e.target).data('unit');
    recruit(u);
    updateUI();
  });
  $('#prestigeBtn').on('click', ()=>{ prestige(); updateUI(); });

  function loop(){
    const now = Date.now();
    const dt = (now - state.lastUpdate)/1000;
    if(dt>0){
      tick(dt);
      state.lastUpdate = now;
      save();
      updateUI();
    }
    setTimeout(loop,1000);
  }

  // offline progress
  (function(){
    const now = Date.now();
    const dt = (now - state.lastUpdate)/1000;
    if(dt>0){
      tick(dt);
      state.lastUpdate = now;
    }
  })();

  updateUI();
  loop();
})();
