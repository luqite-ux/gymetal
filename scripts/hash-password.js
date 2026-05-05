// 生成 bcrypt 密码哈希，用于新租户初始化
// 用法：node scripts/hash-password.js <密码>
// 示例：node scripts/hash-password.js admin123

const bcrypt = require('bcryptjs')
const password = process.argv[2]

if (!password) {
  console.error('用法：node scripts/hash-password.js <密码>')
  process.exit(1)
}

bcrypt.hash(password, 12).then(hash => {
  console.log('\n密码哈希（复制到 SQL 中）：')
  console.log(hash)
})
