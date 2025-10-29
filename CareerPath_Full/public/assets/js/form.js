// form.js — submit application to backend
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admissionForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      marks: Number(document.getElementById('marks').value),
      stream: document.getElementById('stream').value,
      course: document.getElementById('coursePref').value.trim()
    };
    try {
      const res = await fetch('http://localhost:5000/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      const msg = document.getElementById('formMessage');
      if (json.ok) {
        msg.style.color = 'green';
        msg.innerText = 'Application submitted successfully! Your ID: ' + json.id;
        form.reset();
      } else {
        msg.style.color = 'red';
        msg.innerText = json.error || 'Submission failed';
      }
    } catch (err) {
      const msg = document.getElementById('formMessage');
      msg.style.color = 'red';
      msg.innerText = 'Server error: could not submit. Is the backend running on port 5000?';
    }
  });
});
