const setTime = document.getElementById("time-input");
const setDay = document.getElementById("day-input");
const submit = document.getElementById("submit");
const alarms = document.getElementById("cards-container");
const audio = new Audio("./ringtone.mp3");
const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Show live time and date
setInterval(() => {
  const today = new Date();
  document.querySelector(".time-now").innerText = `${today
    .getHours()
    .toString()
    .padStart(2, "0")} : ${today.getMinutes().toString().padStart(2, "0")}`;

  document.querySelector(
    ".date-now"
  ).innerText = `${today.getDate()}.${today.getMonth()+1}.${today.getFullYear()}`;
}, 500);

// Clock Class
class Clock {
  constructor() {
    this.alarms = [];
  }

  setAlarm(time) {
    const newAlarm = {
      id: generateRandomId(),
      snoozeLeft: 3,
      time: format(time),
    };
    this.alarms.push(newAlarm);
    refreshUI();
  }

  getAllAlarms() {
    return this.alarms;
  }

  deleteAlarm(id) {
    this.alarms = this.alarms.filter((alarm) => alarm.id !== id);
    refreshUI();
  }

  snooze(id, cancel = false) {
    this.alarms.map((alarm) => {
      if (id === alarm.id) {
        if (alarm.snoozeLeft === 0 || cancel == true) {
          audio.pause();
          AudioContext.currentTime = 0;
          const newAlarmTime =
            Date.now(alarm.time) +
            7 * 24 * 60 * 60 * 1000 -
            5 * (3 - alarm.snoozeLeft) * 60 * 1000;
          alarm.time = format(new Date(newAlarmTime));
        } else {
          audio.pause();
          AudioContext.currentTime = 0;
          const newAlarmTime = Date.now(alarm.time) + 5 * 60 * 1000;  //add 5 mins
          // console.log(newAlarmTime);
          alarm.time = format(new Date(newAlarmTime));
        }
        alarm.snoozeLeft--; //decrement snooze count
        refreshUI();  //refresh ui
      }
      return alarm;
    });
  }

  playAlarm(id) {
    audio.loop = true;
    audio.play();
  }

  turnOff(id) {
    this.alarms.map((alarm) => {
      if (id === alarm.id) {
        const newTime =
          Date.now(alarm.time) +
          7 * 24 * 60 * 1000 -
          (3 - snoozeLeft) * 5 * 60 * 1000;
        alarm.time = format(new Date(newTime));

        alarm.snoozeLeft = 3;
      }
      return alarm;
    });

    refreshUI();
  }
}

// create clock object
const clock = new Clock();

//UI

//add time to clock to UI
submit.addEventListener("click", () => {
  if (setDay.value == "-" || setTime.value == "") {
    alert("Set Proper Date");
  } else {
    const setHours = parseInt(setTime.value.split(":")[0]);
    const setMinutes = parseInt(setTime.value.split(":")[1]);

    const currentDate = new Date().getDate();
    const currentDay = new Date().getDay();
    const currentHours = new Date().getHours();
    const currentMins = new Date().getMinutes();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    let date = currentDate - currentDay + parseInt(setDay.value);

    if (
      date < currentDate ||
      (date === currentDate &&
        (setHours < currentHours ||
          (setHours === currentHours && setMinutes <= currentMins)))
    ) {
      date += 7;
    }

    let timeForAlarm = new Date(
      currentYear,
      currentMonth,
      date,
      setHours,
      setMinutes,
      0,
      0
    );
    clock.setAlarm(timeForAlarm);
  }
});

// add alarm Card
const addAlarmToUI = (alarmTime, id) => {
  const day = new Date(alarmTime).getDay();
  const timeHH = new Date(alarmTime).getHours();
  const timeMin = new Date(alarmTime).getMinutes();
  const alarmCard = document.createElement("div");
  const weekName = weekDays[day];

  alarmCard.innerHTML = `
  <div class = "alarm-card">
  <div class= "card-top">
  <div class="card-left">
  <div class="alarm-number">${alarms.childElementCount + 1}</div>
  </div>
  <div class="card-right">
  <div class="alarm-time">
  ${timeHH.toString().padStart(2, "0")}:${timeMin
    .toString()
    .padStart(2, "0")} - ${weekName} 
  </div>
  <p class="ring-schedule">
  Next Ring:  ${new Date(alarmTime).getDate()}/${new Date(
    alarmTime
  ).getMonth()+1}/${new Date(alarmTime).getFullYear()}
  </p>
  </div>
  <button class = "delete-button" onclick = "clock.deleteAlarm(${id})"><i class="fa-solid fa-trash-can"></i></button>
  
  </div>
  <div class="card-bottom"  id=${id} ><p></p></div>
  </div>
  
  `;
  alarms.appendChild(alarmCard);
};

//check for rings every 60sand update Alarm Ringing
setInterval(() => {
  const alarms = clock.getAllAlarms();
  alarms.forEach((alarm) => {
    if (isTimeSame(alarm.time, new Date())) {
      clock.playAlarm(alarm.id);
      const elem = document.getElementById(alarm.id);
      const para = document.createElement("div");
      para.innerHTML = `
            <p class="ring">
                  Ringing
              </p>
              <div class="snooze-options">
                  <div onclick = "clock.snooze(${alarm.id})">
                      <i class="fa-solid fa-bell"></i>
                      <span> Snooze Alarm </span>
                  </div>
                  <div onclick = "clock.snooze(${alarm.id}, true);"> 
                      <i class="fa-solid fa-clock"></i> 
                      <span> Stop Alarm </span>
                  </div>
              </div>
            `;
      elem.appendChild(para);
    }
  });
}, 60 * 1000);

// Functions

//ID
const generateRandomId = () => {
  return Math.floor(Math.random() * Date.now());
};

//Format
const format = (time) => {
  const newTime = new Date(time).setMilliseconds(0);
  return new Date(newTime).setSeconds(0);
};

//check time
const isTimeSame = (time1, time2) => {
  if (format(new Date(time1)) === format(new Date(time2))) {
    return true;
  }
  return false;
};

// Sort Alarms
const refreshUI = () => {
  alarms.innerHTML = "";
  const sortedAlarms = clock
    .getAllAlarms()
    .sort((a, b) => new Date(a.time) - new Date(b.time));
  sortedAlarms.forEach((alarm) => addAlarmToUI(alarm.time, alarm.id));
};
