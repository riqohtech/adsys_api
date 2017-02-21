import { AdmindashboardPage } from './app.po';

describe('admindashboard App', function() {
  let page: AdmindashboardPage;

  beforeEach(() => {
    page = new AdmindashboardPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
