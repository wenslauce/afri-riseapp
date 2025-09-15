// Simple test to verify the auth fix
const fs = require('fs');
const path = require('path');

// Check if the auth-client file exists
const authClientPath = path.join(__dirname, 'src', 'lib', 'auth-client.ts');
if (fs.existsSync(authClientPath)) {
    console.log('✅ auth-client.ts exists');
} else {
    console.log('❌ auth-client.ts missing');
}

// Check if LoginForm imports from auth-client
const loginFormPath = path.join(__dirname, 'src', 'components', 'auth', 'LoginForm.tsx');
if (fs.existsSync(loginFormPath)) {
    const content = fs.readFileSync(loginFormPath, 'utf8');
    if (content.includes("from '@/lib/auth-client'")) {
        console.log('✅ LoginForm imports from auth-client');
    } else {
        console.log('❌ LoginForm still imports from server auth');
    }
} else {
    console.log('❌ LoginForm.tsx missing');
}

// Check if server auth doesn't have client utilities
const authPath = path.join(__dirname, 'src', 'lib', 'auth.ts');
if (fs.existsSync(authPath)) {
    const content = fs.readFileSync(authPath, 'utf8');
    if (!content.includes('useSupabaseAuth')) {
        console.log('✅ Server auth cleaned of client utilities');
    } else {
        console.log('❌ Server auth still has client utilities');
    }
} else {
    console.log('❌ auth.ts missing');
}

console.log('\nAuth fix verification complete!');