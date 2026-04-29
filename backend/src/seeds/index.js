const { seedTeacher } = require('./seedTeacher');

async function runStartupSeeds() {
  const teacherCreated = await seedTeacher();

  if (teacherCreated) {
    console.log('Initial teacher account seeded.');
  }
}

module.exports = { runStartupSeeds };
