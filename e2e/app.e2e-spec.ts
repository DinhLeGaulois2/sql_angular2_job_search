import { MyDeweyDecimalSystemPage } from './app.po';

describe('my-dewey-decimal-system App', function() {
  let page: MyDeweyDecimalSystemPage;

  beforeEach(() => {
    page = new MyDeweyDecimalSystemPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
