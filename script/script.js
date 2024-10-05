document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('voucherForm');
  const companyFields = document.getElementById('companyFields');
  const customerTypeRadios = document.getElementsByName('customerType');
  const voucherCheckboxes = document.getElementsByName('voucherType');
  const totalAmountInput = document.querySelector('input[name="totalAmount"]');
  const discountCodeInput = document.querySelector('input[name="discountCode"]');

  const prices = {
    wholeBody: 498,
    local: 249,
    facial: 249,
    discountedFacial: 629,
    discountedWholeBody: 498
  };

  customerTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'company') {
        companyFields.classList.remove('hidden');
      } else {
        companyFields.classList.add('hidden');
      }
    });
  });

  voucherCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const optionsDiv = document.getElementById(this.value + 'Options');
      if (this.checked) {
        optionsDiv.classList.remove('hidden');
      } else {
        optionsDiv.classList.add('hidden');
      }
      calculateTotal();
    });
  });

  function calculateTotal() {
    let total = 0;

    if (document.querySelector('input[name="voucherType"][value="wholeBody"]').checked) {
      total += prices.wholeBody;
      if (document.querySelector('input[name="wholeBodyExtra"]').checked) {
        total += prices.discountedFacial;
      }
    }

    if (document.querySelector('input[name="voucherType"][value="local"]').checked) {
      total += prices.local;
      if (document.querySelector('input[name="localExtra"]').checked) {
        total += prices.discountedWholeBody;
      }
    }

    if (document.querySelector('input[name="voucherType"][value="facial"]').checked) {
      total += prices.facial;
      if (document.querySelector('input[name="facialExtra"]').checked) {
        total += prices.discountedWholeBody;
      }
    }

    totalAmountInput.value = total + ' Kč';
  }

  form.addEventListener('change', calculateTotal);

  discountCodeInput.addEventListener('input', calculateTotal);

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const orderData = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert('Objednávka byla úspěšně odeslána!');
        form.reset();
      } else {
        alert('Došlo k chybě při odesílání objednávky. Zkuste to prosím znovu.');
      }
    } catch (error) {
      console.error('Chyba:', error);
      alert('Došlo k chybě při odesílání objednávky. Zkuste to prosím znovu.');
    }
  });

  calculateTotal();
});