import * as Permissions from "expo-permissions";
import * as Calendar from "expo-calendar";
const _askForCalendarPermissions = async () => {
  const response = await Permissions.askAsync(Permissions.CALENDAR);
  const granted = response.status === "granted";
  return granted;
};

export const createReminder = async (title) => {
  const calendarId = await Calendar.createCalendarAsync({
    title: "test",
    color: "#00AAEE",
    source: {
      isLocalAccount: false,
      name: "Phone",
      type: "com.android.huawei.phone",
    },
    name: "Phone Owner",
    ownerAccount: "phoneowner@test.com",
    accessLevel: "owner",
  });
  console.log(calendarId);
  await _askForCalendarPermissions().then(async (x) => {
    if (x) {
      await Calendar.createEventAsync(calendarId, {
        endDate: "2021-06-13T07:44:24.088-05:00",
        startDate: "2021-06-13T08:00:24.496-05:00",
        title: title,
      });
    }
  });
};
async function getDefaultCalendarSource() {
  const calendars = await Calendar.getCalendarsAsync();
  const defaultCalendars = calendars.filter(
    (each) => each.source.name === "Default"
  );
  return defaultCalendars[0].source;
}
