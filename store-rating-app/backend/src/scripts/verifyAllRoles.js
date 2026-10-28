const BASE_URL = 'http://localhost:5000/api';

async function req(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function verifyAll() {
  console.log('=====================================================');
  console.log('🚀 COMPREHENSIVE ROLE & AUTH VERIFICATION STARTING...');
  console.log('=====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 1. SYSTEM ADMIN ROLE VERIFICATION
  // -------------------------------------------------------------------------
  console.log('🔹 1. Testing System Admin (Rajeshwar Prasad Sharma)...');
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin.rajesh@storerating.in',
      password: 'Admin@1234',
    }),
  });

  assert(adminLogin.ok && adminLogin.data.token, 'Admin successfully logs in');
  assert(adminLogin.data.user.role === 'ADMIN', 'Admin user has role ADMIN');
  const adminToken = adminLogin.data.token;

  // Admin Dashboard stats
  const adminStats = await req('/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminStats.ok, 'Admin can fetch /admin/dashboard metrics');
  assert(adminStats.data.totalUsers >= 8, `Metrics: totalUsers is ${adminStats.data.totalUsers}`);
  assert(adminStats.data.totalStores >= 6, `Metrics: totalStores is ${adminStats.data.totalStores}`);
  assert(adminStats.data.totalRatings >= 12, `Metrics: totalRatings is ${adminStats.data.totalRatings}`);

  // Admin Users List
  const adminUsers = await req('/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminUsers.ok && Array.isArray(adminUsers.data), 'Admin can fetch /admin/users list');
  assert(adminUsers.data.length >= 8, `Users list count: ${adminUsers.data.length} registered users`);

  // Admin Stores List
  const adminStores = await req('/admin/stores', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminStores.ok && Array.isArray(adminStores.data), 'Admin can fetch /admin/stores list');
  assert(adminStores.data.length >= 6, `Stores list count: ${adminStores.data.length} stores`);

  // Check Indian store names in admin list
  const hasKirana = adminStores.data.some((s) => s.name.includes('Apna Kirana Mart'));
  const hasBharat = adminStores.data.some((s) => s.name.includes('Bharat Electronics'));
  const hasJaipur = adminStores.data.some((s) => s.name.includes('Royal Jaipur Sweets'));
  assert(hasKirana && hasBharat && hasJaipur, 'Admin sees Indian stores (Apna Kirana, Bharat Electronics, Jaipur Sweets)');

  // -------------------------------------------------------------------------
  // 2. STORE OWNER ROLE VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n🔹 2. Testing Store Owner (Vikramaditya Narayan Malhotra)...');
  const ownerLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'owner.vikram@kiranamart.in',
      password: 'Owner@1234',
    }),
  });

  assert(ownerLogin.ok && ownerLogin.data.token, 'Store Owner successfully logs in');
  assert(ownerLogin.data.user.role === 'STORE_OWNER', 'User has role STORE_OWNER');
  const ownerToken = ownerLogin.data.token;

  // Owner Dashboard
  const ownerDash = await req('/owner/dashboard', {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  assert(ownerDash.ok && ownerDash.data.hasStore === true, 'Owner dashboard loads linked store');
  assert(
    ownerDash.data.store?.name === 'Apna Kirana Mart & Organic Bazaar',
    `Store name verified: "${ownerDash.data.store?.name}"`
  );
  assert(
    ownerDash.data.totalRatings >= 3,
    `Owner sees ratings for their store (totalRatings: ${ownerDash.data.totalRatings}, avg: ${ownerDash.data.averageRating} ★)`
  );
  assert(
    Array.isArray(ownerDash.data.ratings) && ownerDash.data.ratings.length > 0,
    `Owner sees verified customer reviews (count: ${ownerDash.data.ratings.length} reviews from shoppers)`
  );

  // Security Check: Owner MUST NOT be able to access Admin endpoints
  const ownerAdminAccess = await req('/admin/users', {
    headers: { Authorization: `Bearer ${ownerToken}` },
  });
  assert(
    ownerAdminAccess.status === 403,
    'Store Owner access to /admin/users is strictly FORBIDDEN (403)'
  );

  // -------------------------------------------------------------------------
  // 3. NORMAL USER / SHOPPER ROLE VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n🔹 3. Testing Normal User / Shopper (Ananya Rameshwaram Venkatesh)...');
  const shopperLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'ananya.venkatesh@gmail.com',
      password: 'User@1234',
    }),
  });

  assert(shopperLogin.ok && shopperLogin.data.token, 'Shopper successfully logs in');
  assert(shopperLogin.data.user.role === 'USER', 'User has role USER');
  const shopperToken = shopperLogin.data.token;

  // Shopper Stores Directory
  const shopperStores = await req('/stores', {
    headers: { Authorization: `Bearer ${shopperToken}` },
  });
  assert(shopperStores.ok && Array.isArray(shopperStores.data), 'Shopper can view /stores directory');
  assert(shopperStores.data.length === 6, `Shopper sees all 6 stores (count: ${shopperStores.data.length})`);

  // Verify search by name and address works
  const searchStore = await req('/stores?search=Bandra', {
    headers: { Authorization: `Bearer ${shopperToken}` },
  });
  assert(
    searchStore.ok && searchStore.data.length >= 1 && searchStore.data[0].address.includes('Bandra'),
    'Shopper search by Address ("Bandra") returns matching store'
  );

  // Verify rating submission / modification
  const targetStoreId = shopperStores.data[0].id;
  const submitRating = await req('/ratings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${shopperToken}` },
    body: JSON.stringify({
      storeId: targetStoreId,
      rating: 5,
    }),
  });
  assert(submitRating.ok, 'Shopper can submit / update 1-to-5 star rating');

  // Security Check: Shopper MUST NOT access Admin APIs
  const shopperAdminAccess = await req('/admin/users', {
    headers: { Authorization: `Bearer ${shopperToken}` },
  });
  assert(
    shopperAdminAccess.status === 403,
    'Shopper access to /admin/users is strictly FORBIDDEN (403)'
  );

  // Security Check: Shopper MUST NOT access Owner Dashboard
  const shopperOwnerAccess = await req('/owner/dashboard', {
    headers: { Authorization: `Bearer ${shopperToken}` },
  });
  assert(
    shopperOwnerAccess.status === 403,
    'Shopper access to /owner/dashboard is strictly FORBIDDEN (403)'
  );

  // -------------------------------------------------------------------------
  // 4. PASSWORD & SECURITY (CHANGE PASSWORD) VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n🔹 4. Testing Password Update Flow for Normal User...');
  // Attempt invalid password (missing special char or uppercase)
  const invalidPass = await req('/auth/update-password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${shopperToken}` },
    body: JSON.stringify({
      currentPassword: 'User@1234',
      newPassword: 'weakpassword',
    }),
  });
  assert(invalidPass.status === 400, 'Weak password rejected by policy validator');

  // Change to new valid password
  const changePass = await req('/auth/update-password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${shopperToken}` },
    body: JSON.stringify({
      currentPassword: 'User@1234',
      newPassword: 'NewUser@999',
    }),
  });
  assert(changePass.ok, 'Password updated successfully to "NewUser@999"');

  // Verify login works with NEW password
  const loginWithNewPass = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'ananya.venkatesh@gmail.com',
      password: 'NewUser@999',
    }),
  });
  assert(loginWithNewPass.ok, 'Login with new password succeeds');

  // Revert password back to User@1234 so demo buttons stay consistent
  await req('/auth/update-password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${loginWithNewPass.data.token}` },
    body: JSON.stringify({
      currentPassword: 'NewUser@999',
      newPassword: 'User@1234',
    }),
  });
  console.log('  ℹ️  Reverted password back to default "User@1234" for ongoing demo access');

  // -------------------------------------------------------------------------
  // 5. LOGOUT & INVALID TOKEN VERIFICATION
  // -------------------------------------------------------------------------
  console.log('\n🔹 5. Testing Logout & Unauthenticated Access...');
  const noTokenReq = await req('/stores');
  assert(noTokenReq.status === 401, 'Request without token returns 401 Unauthorized');

  const invalidTokenReq = await req('/stores', {
    headers: { Authorization: 'Bearer fake_corrupted_token_xyz' },
  });
  assert(invalidTokenReq.status === 401, 'Request with invalid token returns 401 Unauthorized');

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n=====================================================');
  console.log(`🏁 VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED!`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL ROLES, LOGINS, APIS, RATINGS, AND PERMISSIONS ARE 100% OPERATIONAL!');
  } else {
    console.log(`⚠️ Some tests failed. Please review the output above.`);
  }
  console.log('=====================================================\n');
}

verifyAll();
