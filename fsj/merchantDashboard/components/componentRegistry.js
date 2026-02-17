const components = {};

function registerComponent(name, component) {
  components[name] = component;
  console.log(`[组件注册] ${name}`);
}

function getComponent(name) {
  return components[name];
}

function getAllComponents() {
  return components;
}

module.exports = {
  registerComponent,
  getComponent,
  getAllComponents
};
