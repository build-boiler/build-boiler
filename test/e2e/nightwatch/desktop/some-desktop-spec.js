module.exports = {
  tags: ['desktop'],
  'Desktop Directory Spec': function(client) {
    client.getTitle((title) => console.log(title));

    client.url(client.launch_url)
      .waitForElementVisible('body', 2000)
      .assertTitle();

    client.expect.element('body').to.be.present;
    ['givenName', 'lastName', 'whatever'].forEach((fieldName) => {
      client.setValue(`[name="${fieldName}"]`, fieldName);
    });

    client.end();
  }
};
