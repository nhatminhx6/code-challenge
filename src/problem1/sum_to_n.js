
// Approach 1: Iterative loop
// Complexity : Time: O(n), Space: O(1)
let sum_to_n_a = function(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
};


// Approach 2 : Math formula
// Complexity: Time: O(1), Space: O(1)
let sum_to_n_b = function(n) {
    return n * (n + 1) / 2;
};


// Approach 3: Recursion
// Complexity: Time: O(n), Space: O(n)
let sum_to_n_c = function(n) {
    if (n === 0) return 0;
    return n + sum_to_n_c(n - 1);
};
