const KEY="mojaRedukcjaV2";
const defaultState={
 settings:{calories:1800,protein:180,steps:10000,goalWeight:90,weighTime:"21:30"},
 reminders:{breakfast:"08:00",lunch:"13:00",snack:"17:00",dinner:"20:00",workout:"18:00"},
 meals:[
  {id:1,time:"08:00",name:"Śniadanie",kcal:450,protein:40,desc:"3 jajka • 2 kromki chleba pełnoziarnistego • 150 g pomidora • 150 g skyru"},
  {id:2,time:"13:00",name:"Obiad",kcal:600,protein:60,desc:"200 g piersi z kurczaka • 300 g ziemniaków • 250 g warzyw • 10 g oliwy • sos jogurtowy"},
  {id:3,time:"17:00",name:"Przekąska",kcal:250,protein:25,desc:"250 g skyru • 150 g owocu"},
  {id:4,time:"20:00",name:"Kolacja",kcal:500,protein:55,desc:"200 g chudego twarogu • 2 kromki chleba • 150 g warzyw • 10 g masła orzechowego"}
 ],
 workouts:[
  {id:1,name:"Trening siłowy A",duration:45,desc:"Przysiady/leg press • wyciskanie • wiosłowanie • ćwiczenia brzucha"},
  {id:2,name:"Trening siłowy B",duration:45,desc:"Martwy ciąg/RDL • wyciskanie nad głowę • przyciąganie • brzuch"},
  {id:3,name:"Spacer",duration:60,desc:"Szybki spacer, cel 8–12 tys. kroków"}
 ],
 weights:{}, days:{}
};
let S=JSON.parse(localStorage.getItem(KEY)||"null")||structuredClone(defaultState);
let selectedDate=localDate();
function localDate(d=new Date()){return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function day(d=selectedDate){if(!S.days[d])S.days[d]={checked:{},steps:0,workoutId:null};return S.days[d]}
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function fmtDate(d){return new Date(d+"T12:00:00").toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})}
function go(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));document.getElementById(id).classList.add("active");document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===id));render()}
function render(){
 const d=day(); const eaten=S.meals.reduce((a,m)=>a+(d.checked[m.id]?Number(m.kcal):0),0);
 document.getElementById("wTop").textContent=Number(S.weights[selectedDate]||Object.values(S.weights).slice(-1)[0]||121).toFixed(1);
 document.getElementById("left").textContent=Math.max(0,S.settings.calories-eaten);
 document.getElementById("pTop").textContent=S.settings.protein;
 document.getElementById("todayLabel").textContent=fmtDate(selectedDate);
 document.getElementById("steps").value=d.steps||0; document.getElementById("stepGoal").value=S.settings.steps;
 const pct=Math.min(100,(d.steps/S.settings.steps)*100);document.getElementById("stepBar").style.width=pct+"%";document.getElementById("stepText").textContent=`${Number(d.steps).toLocaleString("pl-PL")} / ${Number(S.settings.steps).toLocaleString("pl-PL")}`;
 document.getElementById("todayMeals").innerHTML=mealHTML(selectedDate);
 document.getElementById("summary").innerHTML=`<span class="pill">Zjedzone: ${eaten} kcal</span><span class="pill">Pozostało: ${Math.max(0,S.settings.calories-eaten)} kcal</span><span class="pill">Kroki: ${Number(d.steps).toLocaleString("pl-PL")}</span>`;
 renderDays();renderMealManager();renderProgress();renderSettings();renderWorkouts();
}
function mealHTML(date){let d=day(date);return S.meals.map(m=>`<label class="meal"><input type="checkbox" ${d.checked[m.id]?"checked":""} onchange="toggleMeal(${m.id},this.checked,'${date}')"><div class="meal-main"><div class="meal-title">${esc(m.time)} — ${esc(m.name)}</div><div class="meal-desc">${esc(m.desc)}<br><b>~${m.kcal} kcal • ~${m.protein} g białka</b></div></div></label>`).join("")}
function toggleMeal(id,v,date){day(date).checked[id]=v;save();render()}
function renderDays(){
 let out="";let base=new Date(selectedDate+"T12:00:00");for(let i=-3;i<11;i++){let x=new Date(base);x.setDate(x.getDate()+i);let ds=localDate(x);out+=`<button class="day ${ds===selectedDate?"selected":""}" onclick="selectedDate='${ds}';render()"><b>${x.getDate()}</b>${x.toLocaleDateString("pl-PL",{weekday:"short"})}</button>`}
 document.getElementById("calendar").innerHTML=out;
 document.getElementById("selectedDateTitle").textContent=fmtDate(selectedDate);
 document.getElementById("selectedDayMeals").innerHTML=mealHTML(selectedDate);
 let w=day().workoutId, obj=S.workouts.find(x=>x.id==w);document.getElementById("selectedWorkout").innerHTML=`<hr><b>Trening:</b> ${obj?esc(obj.name)+" • "+obj.duration+" min":"brak"} <button class="btn secondary small" onclick="editWorkoutForDay()">Zmień</button>`;
}
function editDay(){let d=day();openModal(`<h2>Edytuj dzień</h2><label>Cel kroków<input id="mdSteps" type="number" value="${d.steps||0}"></label><br><label>Trening<select id="mdWorkout"><option value="">Brak</option>${S.workouts.map(w=>`<option value="${w.id}" ${d.workoutId==w.id?"selected":""}>${esc(w.name)}</option>`).join("")}</select></label><br><button onclick="saveDayEdit()">Zapisz</button>`)}
function saveDayEdit(){let d=day();d.steps=Number(document.getElementById("mdSteps").value)||0;d.workoutId=Number(document.getElementById("mdWorkout").value)||null;save();closeModal();render()}
function editWorkoutForDay(){editDay()}
function renderMealManager(){document.getElementById("mealManager").innerHTML=S.meals.map(m=>`<div class="card listitem"><div class="row"><b>${esc(m.time)} — ${esc(m.name)}</b><div class="actions"><button class="btn small" onclick="editMeal(${m.id})">Edytuj</button><button class="btn danger small" onclick="deleteMeal(${m.id})">Usuń</button></div></div><p class="muted">${m.kcal} kcal • ${m.protein} g białka</p><div class="meal-desc">${esc(m.desc)}</div></div>`).join("")}
function newMeal(){editMeal(null)}
function editMeal(id){let m=S.meals.find(x=>x.id===id)||{id:null,time:"08:00",name:"Nowy posiłek",kcal:300,protein:25,desc:""};openModal(`<h2>${id?"Edytuj":"Dodaj"} posiłek</h2><div class="two"><label>Godzina<input id="mt" type="time" value="${m.time}"></label><label>Kalorie<input id="mk" type="number" value="${m.kcal}"></label><label>Nazwa<input id="mn" value="${esc(m.name)}"></label><label>Białko (g)<input id="mp" type="number" value="${m.protein}"></label></div><br><label>Opis / składniki<textarea id="md">${esc(m.desc)}</textarea></label><br><button onclick="saveMeal(${id||0})">Zapisz</button> <button class="btn secondary" onclick="closeModal()">Anuluj</button>`)}
function saveMeal(id){let obj={id:id||Date.now(),time:mt.value,name:mn.value,kcal:Number(mk.value)||0,protein:Number(mp.value)||0,desc:md.value};if(id){let i=S.meals.findIndex(x=>x.id===id);S.meals[i]=obj}else S.meals.push(obj);S.meals.sort((a,b)=>a.time.localeCompare(b.time));save();closeModal();render()}
function deleteMeal(id){if(confirm("Usunąć ten posiłek?")){S.meals=S.meals.filter(x=>x.id!==id);save();render()}}
function renderProgress(){document.getElementById("weightInput").value=S.weights[selectedDate]||"";document.getElementById("goalWeight").value=S.settings.goalWeight;document.getElementById("calTarget").value=S.settings.calories;document.getElementById("proteinTarget").value=S.settings.protein;document.getElementById("globalSteps").value=S.settings.steps;document.getElementById("weighTime").value=S.settings.weighTime;
 let entries=Object.entries(S.weights).sort().reverse().slice(0,14);document.getElementById("weightHistory").innerHTML=entries.length?entries.map(([d,w])=>`<div class="row" style="padding:7px 0;border-bottom:1px solid var(--line)"><span>${fmtDate(d)}</span><b>${w} kg</b></div>`).join(""):"<span class='muted'>Brak zapisów.</span>"}
function saveWeight(){let v=Number(document.getElementById("weightInput").value);if(v>0){S.weights[selectedDate]=v;save();render();alert("Waga zapisana.")}}
function saveSettings(){S.settings.calories=Number(calTarget.value)||1800;S.settings.protein=Number(proteinTarget.value)||180;S.settings.steps=Number(globalSteps.value)||10000;S.settings.goalWeight=Number(goalWeight.value)||90;S.settings.weighTime=weighTime.value||"21:30";save();render();alert("Ustawienia zapisane.")}
function renderSettings(){document.getElementById("reminderFields").innerHTML=[["breakfast","Śniadanie"],["lunch","Obiad"],["snack","Przekąska"],["dinner","Kolacja"],["workout","Trening"]].map(([k,n])=>`<div style="margin-bottom:9px"><span class="muted">${n}</span><input type="time" value="${S.reminders[k]}" onchange="S.reminders['${k}']=this.value;save()"></div>`).join("")}
function requestNotifications(){if(!("Notification"in window)){alert("Ta przeglądarka nie obsługuje powiadomień.");return}Notification.requestPermission().then(p=>alert(p==="granted"?"Zgoda na powiadomienia przyznana. Uwaga: iOS/PWA może ograniczać alarmy o konkretnej godzinie.":"Nie przyznano zgody."))}
function renderWorkouts(){document.getElementById("workoutManager").innerHTML=S.workouts.map(w=>`<div class="listitem"><div class="row"><b>${esc(w.name)}</b><div><button class="btn small" onclick="editWorkout(${w.id})">Edytuj</button> <button class="btn danger small" onclick="deleteWorkout(${w.id})">Usuń</button></div></div><div class="muted">${w.duration} min • ${esc(w.desc)}</div></div>`).join("")}
function newWorkout(){editWorkout(null)}
function editWorkout(id){let w=S.workouts.find(x=>x.id===id)||{id:null,name:"Nowy trening",duration:45,desc:""};openModal(`<h2>${id?"Edytuj":"Dodaj"} trening</h2><label>Nazwa<input id="wn" value="${esc(w.name)}"></label><br><div class="two"><label>Minuty<input id="wd" type="number" value="${w.duration}"></label><label>Opis<textarea id="wx">${esc(w.desc)}</textarea></label></div><br><button onclick="saveWorkout(${id||0})">Zapisz</button>`)}
function saveWorkout(id){let o={id:id||Date.now(),name:wn.value,duration:Number(wd.value)||30,desc:wx.value};if(id)S.workouts[S.workouts.findIndex(x=>x.id===id)]=o;else S.workouts.push(o);save();closeModal();render()}
function deleteWorkout(id){if(confirm("Usunąć trening?")){S.workouts=S.workouts.filter(x=>x.id!==id);save();render()}}
function openWorkout(){let w=day().workoutId?S.workouts.find(x=>x.id==day().workoutId):S.workouts[0];openModal(`<h2>${esc(w?.name||"Trening")}</h2><p>${esc(w?.desc||"Ustaw trening dla tego dnia.")}</p><p><b>${w?.duration||0} min</b></p><button onclick="closeModal()">Gotowe</button>`)}
function openModal(html){sheet.innerHTML=html;modal.classList.add("show")}function closeModal(){modal.classList.remove("show")}
function exportData(){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:"application/json"}));a.download="moja-redukcja-backup.json";a.click()}
function importData(){fileImport.click()}fileImport.onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{S=JSON.parse(r.result);save();render();alert("Dane zaimportowane.")}catch{alert("Nieprawidłowy plik.")}};r.readAsText(f)}
function resetApp(){if(confirm("Na pewno usunąć wszystkie dane?")){localStorage.removeItem(KEY);S=structuredClone(defaultState);render()}}
steps.oninput=()=>{day().steps=Number(steps.value)||0;save();render()}
stepGoal.onchange=()=>{S.settings.steps=Number(stepGoal.value)||10000;save();render()}
document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")closeModal()}
render();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");
