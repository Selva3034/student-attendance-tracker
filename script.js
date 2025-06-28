document.addEventListener('DOMContentLoaded', function () {
  // === HAMBURGER MENU ===
  const menuBtn = document.getElementById('menu-btn');
  const menuOverlay = document.getElementById('menu-overlay');

  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener('click', () => {
      menuOverlay.style.display = (menuOverlay.style.display === 'block') ? 'none' : 'block';
    });

    const overlayLinks = document.querySelectorAll('#menu-overlay a');
    overlayLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuOverlay.style.display = 'none';
      });
    });
  }

  // === ATTENDANCE MARKER (attendance.html) ===
  const attendanceForm = document.getElementById('attendance-form');
  if (attendanceForm) {
    attendanceForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const date = document.getElementById('date').value;
      const period = document.getElementById('period').value;
      const status = document.getElementById('status').value;

      if (!date || !period || !status) {
        alert('Please fill all fields!');
        return;
      }

      const key = `attendance-${date}`;
      const existingData = JSON.parse(localStorage.getItem(key)) || {};

      // ✅ If "All Period" selected, save for all period-0 to period-5
      if (period === 'all') {
        for (let i = 0; i <= 5; i++) {
          existingData[`period-${i}`] = status;
        }
      } else {
        existingData[`period-${period}`] = status;
      }

      localStorage.setItem(key, JSON.stringify(existingData));

      // ✅ Show success message
      const msg = document.getElementById('message');
      msg.innerText = `Attendance saved for ${date}${period === 'all' ? ' (All Periods)' : ' - Period ' + period}`;
      msg.style.color = 'green';
      attendanceForm.reset();
    });
  }

  // === CALCULATOR PAGE (calculator.html) ===
  const daysPresentSpan = document.getElementById('days-present');
  const daysAbsentSpan = document.getElementById('days-absent');
  const percentageSpan = document.getElementById('percentage');

  if (daysPresentSpan && daysAbsentSpan && percentageSpan) {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('attendance-'));
    let present = 0, absent = 0;

    keys.forEach(key => {
      const day = JSON.parse(localStorage.getItem(key));
      for (let period in day) {
        const value = day[period];
        if (value === 'present') present++;
        else if (value === 'absent') absent++;
      }
    });

    const total = present + absent;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    daysPresentSpan.textContent = present;
    daysAbsentSpan.textContent = absent;
    percentageSpan.textContent = `${percent}%`;

    // ✅ COPY TO CLIPBOARD
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const result = `Attendance Summary:\n✅ Present: ${present}\n❌ Absent: ${absent}\n📊 Percentage: ${percent}%`;
        navigator.clipboard.writeText(result).then(() => {
          alert("Result copied to clipboard!");
        });
      });
    }
    // ✅ RESET ATTENDANCE BUTTON
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all attendance data?')) {
          const keys = Object.keys(localStorage).filter(k => k.startsWith('attendance-'));
          keys.forEach(k => localStorage.removeItem(k));
          alert('All attendance records cleared.');
          location.reload(); // Refresh the summary
        }
      });
    }
        const downloadBtn = document.getElementById('download-txt-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const attendanceKeys = Object.keys(localStorage).filter(k => k.startsWith('attendance-'));
        if (attendanceKeys.length === 0) {
          alert("No attendance data to download.");
          return;
        }

        let content = "Attendance Summary:\n\n";

        attendanceKeys.forEach(key => {
          const date = key.replace('attendance-', '');
          const data = JSON.parse(localStorage.getItem(key));
          content += `Date: ${date}\n`;
          for (let period in data) {
            content += `${period}: ${data[period]}\n`;
          }
          content += '\n';
        });

        // Create blob and download
        const blob = new Blob([content], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "AttendanceSummary.txt";
        link.click();
      });
    }
  }
});