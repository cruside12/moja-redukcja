const MEALS=[
{time:"08:00",name:"Śniadanie",kcal:450,protein:40,desc:"3 jajka • 2 kromki chleba pełnoziarnistego • 150 g pomidora • 150 g skyru"},
{time:"13:00",name:"Obiad",kcal:600,protein:60,desc:"200 g piersi z kurczaka • 300 g ziemniaków • 250 g warzyw • 10 g oliwy • sos jogurtowy"},
{time:"17:00",name:"Przekąska",kcal:250,protein:25,desc:"250 g skyru • 150 g owocu"},
{time:"20:00",name:"Kolacja",kcal:500,protein:55,desc:"200 g chudego twarogu • 2 kromki chleba • 150 g warzyw • 10 g masła orzechowego"}
];
const WORKOUTS=["Trening siłowy A — 45 min","Spacer — 10 000 kroków","Trening siłowy B — 45 min","Spacer — 10 000 kroków","Trening siłowy A — 45 min","Spacer — 10–12 000 kroków","Regeneracja — 7–10 000 kroków"];
const todayKey=new Date().toISOString().slice(0,10);
const $=id=>document.getElementById(id);
$("date").textContent=new Date().toLocaleDateString("pl-PL",{day:"numeric",month:"long"});
let state=JSON.parse(localStorage.getItem("redukcja_"+todayKey)||'{"meals":{},"steps":0}');
let weight=localStorage.getItem("weight")||"121";
$("weight").textContent=Number(weight).toFixed(1); $("weightInput").value=weight;
function render(){
 $("meals").innerHTML=MEALS.map((m,i)=>`<label class="meal"><input type="checkbox" data-i="${i}" ${state.meals[i]?"checked":""}><div><b>${m.time} — ${m.name}</b><small>${m.desc}<br><strong>~${m.kcal} kcal • ~${m.protein} g białka</strong></small></div></label>`).join("");
 document.querySelectorAll("[data-i]").forEach(x=>x.onchange=()=>{state.meals[x.dataset.i]=x.checked;save();});
 const eaten=MEALS.reduce((s,m,i)=>s+(state.meals[i]?m.kcal:0),0);
 $("remaining").textContent=Math.max(0,1800-eaten);
 $("steps").value=state.steps||0;
 const goal=Number($("stepGoal").value)||10000; const pct=Math.min(100,(state.steps/goal)*100);
 $("stepBar").style.width=pct+"%"; $("stepText").textContent=`${Number(state.steps).toLocaleString("pl-PL")} / ${goal.toLocaleString("pl-PL")}`;
 const d=new Date().getDay(); $("workout").textContent=WORKOUTS[(d+6)%7];
}
function save(){localStorage.setItem("redukcja_"+todayKey,JSON.stringify(state));render();}
$("steps").oninput=()=>{state.steps=Number($("steps").value)||0;save()};
$("stepGoal").oninput=render;
$("saveWeight").onclick=()=>{let v=Number($("weightInput").value);if(v>0){weight=v;localStorage.setItem("weight",v);$("weight").textContent=v.toFixed(1);alert("Waga zapisana.");}};
$("reminders").onclick=async()=>{
 if("Notification" in window){
  const p=await Notification.requestPermission();
  if(p==="granted"){alert("Powiadomienia zostały włączone. Wersja PWA może nie wykonywać lokalnych alarmów o określonej godzinie na każdym iPhonie. Do pewnych alarmów użyj systemowych przypomnień/zegarów.");}
  else alert("Powiadomienia nie zostały przyznane.");
 } else alert("Ta przeglądarka nie obsługuje powiadomień.");
};
render();
if("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
