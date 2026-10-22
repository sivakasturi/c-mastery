/* C Mastery — course content, part 2 (Modules 6–9: Intermediate) */
window.COURSE = window.COURSE || [];
(function () {
const R = String.raw;

COURSE.push({
  title: "Arrays & Strings",
  level: "Intermediate",
  icon: "🔤",
  cards: [
    {
      title: "Arrays",
      body: R`<p>An array is a fixed-size row of elements of the <b>same type</b>, stored one after another in memory. Indexes start at <b>0</b>.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int scores[5] = {90, 72, 85, 64, 99};
    int zeros[100] = {0};             // all elements zero
    int primes[] = {2, 3, 5, 7, 11};  // size inferred: 5

    size_t n = sizeof scores / sizeof scores[0];   // element count
    int sum = 0;
    for (size_t i = 0; i < n; i++)
        sum += scores[i];

    printf("count=%zu avg=%.1f first=%d last=%d\n",
           n, (double)sum / n, scores[0], scores[n - 1]);
    printf("%d %d\n", zeros[50], primes[4]);
    return 0;
}`,
      out: "count=5 avg=82.0 first=90 last=99\n0 11\n",
      tip: R`The <code>sizeof arr / sizeof arr[0]</code> trick only works where the real array is in scope, not on an array that was passed to a function (see two cards ahead).`
    },
    {
      title: "Out of bounds = undefined behavior",
      body: R`<p>C does <b>not</b> check array bounds. Reading or writing past the end silently touches whatever memory lies there: other variables, the return address, anything.</p>
<p>This single fact is behind decades of security exploits (buffer overflows).</p>`,
      code: R`int a[5];
a[5] = 42;      // BUG: valid indexes are 0..4
a[-1] = 7;      // BUG

for (int i = 0; i <= 5; i++)   // BUG: <= should be <
    a[i] = 0;`,
      run: false,
      warn: R`The program might crash, might seem fine, or might corrupt data far away from the bug. Compile with <code>-fsanitize=address</code> while developing to catch these the moment they happen.`
    },
    {
      title: "Multidimensional arrays",
      body: R`<p>An array of arrays. <code>int grid[3][4]</code> has 3 rows of 4 ints, stored <b>row by row</b> (row-major order) in one contiguous block.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int m[3][4] = {
        {1,  2,  3,  4},
        {5,  6,  7,  8},
        {9, 10, 11, 12}
    };

    for (int r = 0; r < 3; r++) {
        for (int c = 0; c < 4; c++)
            printf("%3d", m[r][c]);
        printf("\n");
    }
    printf("m[1][2] = %d\n", m[1][2]);
    return 0;
}`,
      out: "  1  2  3  4\n  5  6  7  8\n  9 10 11 12\nm[1][2] = 7\n",
      tip: R`Loop with the <b>last</b> index innermost (<code>[r][c]</code> with c inside). You'll then walk memory in order, which is much faster thanks to the CPU cache.`
    },
    {
      title: "Passing arrays to functions",
      body: R`<p>When you pass an array to a function, it <b>decays</b> into a pointer to its first element. The function can't tell how long the array is, so <b>always pass the length</b> along with it.</p>
<p>Because the function gets a pointer, it can modify the caller's array.</p>`,
      code: R`#include <stdio.h>
#include <stddef.h>

void fill(int *arr, size_t len, int value) {   // same as int arr[]
    for (size_t i = 0; i < len; i++)
        arr[i] = value;
}

int max_of(const int arr[], size_t len) {      // const: read-only
    int best = arr[0];
    for (size_t i = 1; i < len; i++)
        if (arr[i] > best) best = arr[i];
    return best;
}

int main(void) {
    int data[6];
    fill(data, 6, 3);
    data[4] = 17;
    printf("max = %d\n", max_of(data, 6));
    return 0;
}`,
      out: "max = 17\n"
    },
    {
      title: "Strings are char arrays",
      body: R`<p>C has no string type. A string is an array of <code>char</code> that ends with a <b>null terminator</b> <code>'\0'</code> (a byte with value 0). Every string function relies on that terminator to find the end.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    char a[] = "Hi";                 // 3 bytes: 'H' 'i' '\0'
    char b[10] = "Hey";              // rest filled with '\0'
    char c[] = {'C', '9', '9', '\0'};

    printf("%s %s %s\n", a, b, c);
    printf("sizeof a = %zu\n", sizeof a);

    for (int i = 0; a[i] != '\0'; i++)
        printf("a[%d] = '%c' (%d)\n", i, a[i], a[i]);
    return 0;
}`,
      out: "Hi Hey C99\nsizeof a = 3\na[0] = 'H' (72)\na[1] = 'i' (105)\n",
      warn: R`Forget the <code>'\0'</code> and functions like <code>printf("%s")</code> keep reading past the end of your array into random memory.`
    },
    {
      title: "string.h essentials",
      body: R`
<table>
<tr><td><code>strlen(s)</code></td><td>length, not counting '\0'</td></tr>
<tr><td><code>strcmp(a,b)</code></td><td>0 if equal, &lt;0 or &gt;0 otherwise</td></tr>
<tr><td><code>strcpy(dst,src)</code></td><td>copy (⚠️ no bounds check)</td></tr>
<tr><td><code>strcat(dst,src)</code></td><td>append (⚠️ no bounds check)</td></tr>
<tr><td><code>strchr / strstr</code></td><td>find a char / substring</td></tr>
<tr><td><code>snprintf(buf,n,...)</code></td><td>✅ safe, bounded formatting</td></tr>
</table>`,
      code: R`#include <stdio.h>
#include <string.h>

int main(void) {
    char name[] = "Ritchie";
    printf("len = %zu\n", strlen(name));

    if (strcmp(name, "Ritchie") == 0)      // never use == on strings!
        printf("match\n");

    char buf[32];
    snprintf(buf, sizeof buf, "Dennis %s, %d", name, 1941);
    printf("%s\n", buf);

    char *p = strstr(buf, "Rit");
    if (p) printf("found at index %td\n", p - buf);
    return 0;
}`,
      out: "len = 7\nmatch\nDennis Ritchie, 1941\nfound at index 7\n",
      warn: R`<code>a == b</code> on two strings compares their <b>addresses</b>, not their contents. Use <code>strcmp</code>.`
    },
    {
      title: "Reading a line safely",
      body: R`<p><code>gets()</code> was so dangerous it was <b>removed</b> from the language in C11. Use <code>fgets</code>, which never writes past the buffer size you give it:</p>`,
      code: R`#include <stdio.h>
#include <string.h>

int main(void) {
    char line[64];
    printf("Your name: ");
    if (fgets(line, sizeof line, stdin) == NULL)
        return 1;                       // EOF or error

    line[strcspn(line, "\n")] = '\0';  // strip the trailing newline
    printf("Hello, %s!\n", line);
    return 0;
}`,
      run: false,
      tip: R`<code>fgets</code> keeps the newline character if it fits. The <code>strcspn</code> idiom removes it safely even when no newline is present.`
    }
  ],
  quiz: [
    { q: "How many bytes does `char s[] = \"cat\";` occupy?", opts: ["3", "4", "8", "It depends"], a: 1, why: "3 characters plus the '\\0' terminator." },
    { q: "How do you compare two strings for equality?", opts: ["a == b", "strcmp(a, b) == 0", "a.equals(b)", "strlen(a) == strlen(b)"], a: 1, why: "== compares pointers; strcmp compares the characters." },
    { q: "What happens if you write to arr[10] in `int arr[10]`?", opts: ["Runtime exception", "Array grows automatically", "Undefined behavior", "Compile error, always"], a: 2, why: "C has no bounds checking; it's UB and a classic security hole." },
    { q: "Inside `void f(int a[])`, what is `sizeof a`?", opts: ["The array's total size", "The size of a pointer", "The element count", "0"], a: 1, why: "Array parameters decay to pointers, so sizeof gives the pointer size." }
  ]
});

COURSE.push({
  title: "Pointers",
  level: "Intermediate",
  icon: "👉",
  cards: [
    {
      title: "Memory and addresses",
      body: R`<p>Think of memory as a giant array of bytes, each with a numbered <b>address</b>. Every variable lives at some address.</p>
<p>The <code>&amp;</code> operator gives you a variable's address:</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int x = 42;
    double d = 3.5;
    printf("x lives at %p and uses %zu bytes\n", (void *)&x, sizeof x);
    printf("d lives at %p and uses %zu bytes\n", (void *)&d, sizeof d);
    return 0;
}`,
      outNote: "addresses differ on every run",
      tip: R`Pointers are the heart of C. If this module feels hard, that's normal. Read it twice and run every example yourself.`
    },
    {
      title: "Declaring & dereferencing",
      body: R`<p>A <b>pointer</b> is a variable that stores an address.</p>
<ul>
<li><code>int *p;</code> declares p as a “pointer to int”</li>
<li><code>p = &amp;x;</code> makes p point at x</li>
<li><code>*p</code> <b>dereferences</b> p, meaning “the thing p points to”</li>
</ul>`,
      code: R`#include <stdio.h>

int main(void) {
    int x = 10;
    int *p = &x;          // p holds the address of x

    printf("x = %d, *p = %d\n", x, *p);
    *p = 99;              // write through the pointer
    printf("x is now %d\n", x);

    int y = 5;
    p = &y;               // re-point p at y
    *p += 1;
    printf("y is now %d\n", y);
    return 0;
}`,
      out: "x = 10, *p = 10\nx is now 99\ny is now 6\n",
      tip: R`Read declarations from right to left: <code>int *p</code> means “p is a pointer to int”.`
    },
    {
      title: "Pointers let functions modify data",
      body: R`<p>Remember pass-by-value? If you pass the <b>address</b> instead, the function can reach back and change the original. This is also how C returns more than one value.</p>`,
      code: R`#include <stdio.h>

void swap(int *a, int *b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

void min_max(const int *arr, int n, int *min, int *max) {
    *min = *max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] < *min) *min = arr[i];
        if (arr[i] > *max) *max = arr[i];
    }
}

int main(void) {
    int x = 1, y = 2;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);

    int v[] = {4, -2, 9, 0}, lo, hi;
    min_max(v, 4, &lo, &hi);
    printf("min=%d max=%d\n", lo, hi);
    return 0;
}`,
      out: "x=2 y=1\nmin=-2 max=9\n",
      tip: R`Now you know why <code>scanf("%d", &amp;n)</code> needs the <code>&amp;</code>: scanf has to write into your variable.`
    },
    {
      title: "Pointer arithmetic",
      body: R`<p>Adding 1 to a pointer moves it forward by <b>one element</b>, which is <code>sizeof(*p)</code> bytes, not one byte. Subtracting two pointers into the same array gives the distance between them in elements.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int a[] = {10, 20, 30, 40, 50};
    int *p = a;                 // points at a[0]

    printf("%d %d %d\n", *p, *(p + 1), *(p + 4));
    p += 2;
    printf("now *p = %d\n", *p);

    int *end = a + 5;           // one past the last element (legal to form)
    printf("elements left: %td\n", end - p);

    for (int *q = a; q < end; q++)   // idiomatic pointer loop
        printf("%d ", *q);
    printf("\n");
    return 0;
}`,
      out: "10 20 50\nnow *p = 30\nelements left: 3\n10 20 30 40 50 \n",
      warn: R`You may <i>form</i> a pointer one past the end of an array, but never dereference it. Anything further out is undefined behavior.`
    },
    {
      title: "Arrays vs pointers",
      body: R`<p><code>a[i]</code> is defined as <code>*(a + i)</code>. In most expressions an array name turns into a pointer to its first element. But an array is <b>not</b> a pointer:</p>
<ul>
<li><code>sizeof array</code> gives the whole array's size; <code>sizeof pointer</code> gives just 8 (on 64-bit)</li>
<li>You can't assign to an array name (<code>a = b;</code> is an error)</li>
<li><code>&amp;a</code> has type “pointer to whole array”</li>
</ul>`,
      code: R`#include <stdio.h>

int main(void) {
    int a[4] = {1, 2, 3, 4};
    int *p = a;

    printf("%d %d %d\n", a[2], *(a + 2), p[2]);   // all identical
    printf("%zu vs %zu\n", sizeof a, sizeof p);
    return 0;
}`,
      out: "3 3 3\n16 vs 8\n",
      outNote: "on a 64-bit machine"
    },
    {
      title: "NULL: the pointer to nothing",
      body: R`<p><code>NULL</code> is a special value meaning “points nowhere”. Functions return it to signal failure, such as <code>malloc</code> running out of memory or <code>fopen</code> not finding a file. Dereferencing NULL is undefined behavior and usually crashes the program (a segfault).</p>`,
      code: R`#include <stdio.h>
#include <string.h>

int main(void) {
    const char *text = "hello world";
    char *hit = strchr(text, 'z');      // returns NULL if not found

    if (hit == NULL) {
        printf("no 'z' found\n");
    } else {
        printf("found: %s\n", hit);
    }

    int *p = NULL;                      // initialise pointers you can't set yet
    if (p) printf("never\n");           // NULL is "false" in conditions
    return 0;
}`,
      out: "no 'z' found\n",
      tip: R`Rule: a pointer should always hold either a <b>valid address</b> or <code>NULL</code>, never garbage. (C23 adds <code>nullptr</code> as a typed alternative.)`
    },
    {
      title: "Pointers to pointers",
      body: R`<p>A pointer is a variable too, so it has an address. <code>int **pp</code> is a pointer to a pointer to int. You use one when a function needs to <b>change which address the caller's pointer holds</b>, and for arrays of strings like <code>argv</code>.</p>`,
      code: R`#include <stdio.h>

static int fallback = -1;

void point_to_fallback(int **pp) {
    *pp = &fallback;          // change the caller's pointer itself
}

int main(void) {
    int x = 5;
    int *p = &x;
    int **pp = &p;
    printf("%d %d %d\n", x, *p, **pp);

    point_to_fallback(&p);
    printf("p now points to %d\n", *p);

    const char *words[] = {"alpha", "beta", "gamma"};
    const char **w = words;
    printf("%s %c\n", *(w + 1), **(w + 2));
    return 0;
}`,
      out: "5 5 5\np now points to -1\nbeta g\n"
    },
    {
      title: "const and pointers",
      body: R`<p>Where you put <code>const</code> changes its meaning. Read the declaration from right to left:</p>
<table>
<tr><td><code>const int *p</code></td><td>pointer to a <b>const int</b>: you can't change *p, but you can repoint p</td></tr>
<tr><td><code>int *const p</code></td><td><b>const pointer</b> to int: you can change *p, but p always points to the same place</td></tr>
<tr><td><code>const int *const p</code></td><td>neither can change</td></tr>
</table>`,
      code: R`int x = 1, y = 2;

const int *a = &x;   // *a = 5;  error    a = &y;  ok
int *const b = &x;   // *b = 5;  ok       b = &y;  error
const int *const c = &x;  // both are errors`,
      run: false,
      tip: R`Use <code>const T *</code> on function parameters you only read. It documents intent and lets the compiler catch accidental writes.`
    },
    {
      title: "String literals vs char arrays",
      body: R`<p>The two look similar but behave very differently:</p>`,
      code: R`#include <stdio.h>

int main(void) {
    char arr[] = "hello";        // a modifiable COPY on the stack
    const char *lit = "hello";   // points to read-only memory

    arr[0] = 'J';                // fine
    // lit[0] = 'J';             // undefined behavior (often a crash)

    printf("%s %s\n", arr, lit);
    printf("%zu %zu\n", sizeof arr, sizeof lit);
    return 0;
}`,
      out: "Jello hello\n6 8\n",
      outNote: "on a 64-bit machine",
      warn: R`Always declare pointers to string literals as <code>const char *</code>. Then the compiler stops you from writing to them.`
    }
  ],
  quiz: [
    { q: "If `int *p = &x;`, what does `*p = 7;` do?", opts: ["Makes p point to address 7", "Sets x to 7", "Sets p to 7", "Nothing"], a: 1, why: "*p is the int that p points to, which is x." },
    { q: "With `int a[5]; int *p = a;` what is `p + 1`?", opts: ["Address of a plus 1 byte", "Address of a[1]", "Value a[0] + 1", "Undefined"], a: 1, why: "Pointer arithmetic moves in units of the pointed-to type." },
    { q: "`const char *s` means…", opts: ["s cannot be reassigned", "the chars s points to cannot be modified through s", "s is a constant string literal only", "nothing — const is ignored"], a: 1, why: "const binds to char here: the pointee is read-only, the pointer itself can change." },
    { q: "Why does scanf need `&n`?", opts: ["Style convention", "To pass n's address so scanf can store into it", "To make n global", "To convert n to a string"], a: 1, why: "Without the address, scanf would only get a copy of n's value." }
  ]
});

COURSE.push({
  title: "Dynamic Memory",
  level: "Intermediate",
  icon: "🧠",
  cards: [
    {
      title: "Memory layout of a program",
      body: R`<p>A running C program's memory is split into regions:</p>
<table>
<tr><td><b>Text</b></td><td>the machine code (read-only)</td></tr>
<tr><td><b>Data / BSS</b></td><td>globals and <code>static</code> variables (BSS holds the zero-initialised ones)</td></tr>
<tr><td><b>Heap</b> ↑</td><td>memory you request at run time with <code>malloc</code>; it lives until you <code>free</code> it</td></tr>
<tr><td><b>Stack</b> ↓</td><td>local variables and call frames; freed automatically when a function returns, and limited in size (often 8 MB)</td></tr>
</table>
<p>Use the heap when the size is only known at run time, when data must outlive the function that creates it, or when it's too big for the stack.</p>`,
      warn: R`Never return the address of a local variable. Its stack memory is reclaimed the moment the function returns.`
    },
    {
      title: "malloc & free",
      body: R`<p><code>malloc(bytes)</code> reserves memory on the heap and returns a pointer to it, or <code>NULL</code> on failure. <code>free(ptr)</code> gives it back. <b>Every malloc needs exactly one free.</b></p>`,
      code: R`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    size_t n = 5;
    int *arr = malloc(n * sizeof *arr);     // room for n ints
    if (arr == NULL) {
        fprintf(stderr, "out of memory\n");
        return 1;
    }

    for (size_t i = 0; i < n; i++)
        arr[i] = (int)(i * i);
    for (size_t i = 0; i < n; i++)
        printf("%d ", arr[i]);
    printf("\n");

    free(arr);       // release it
    arr = NULL;      // avoid a dangling pointer
    return 0;
}`,
      out: "0 1 4 9 16 \n",
      tip: R`Write <code>malloc(n * sizeof *arr)</code> rather than <code>sizeof(int)</code>. It stays correct if you later change arr's type. In C you don't need to cast malloc's result.`
    },
    {
      title: "calloc & realloc",
      body: R`
<ul>
<li><code>calloc(count, size)</code> works like malloc but <b>zeroes</b> the memory and checks <code>count × size</code> for overflow.</li>
<li><code>realloc(ptr, newSize)</code> grows or shrinks a block. It may <b>move</b> the block and return a different address.</li>
</ul>`,
      code: R`#include <stdio.h>
#include <stdlib.h>

int main(void) {
    int *a = calloc(3, sizeof *a);          // {0, 0, 0}
    if (!a) return 1;

    // WRONG: a = realloc(a, ...);  — on failure the old block leaks
    int *tmp = realloc(a, 6 * sizeof *a);
    if (!tmp) { free(a); return 1; }
    a = tmp;

    for (int i = 3; i < 6; i++) a[i] = i * 10;
    for (int i = 0; i < 6; i++) printf("%d ", a[i]);
    printf("\n");
    free(a);
    return 0;
}`,
      out: "0 0 0 30 40 50 \n"
    },
    {
      title: "Build a growable array",
      body: R`<p>Fixed arrays can't grow, but you can build one that does. This is how C++'s <code>std::vector</code> and Python's <code>list</code> work underneath: when the array fills up, <b>double the capacity</b>.</p>`,
      code: R`#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int *data;
    size_t len, cap;
} Vec;

int vec_push(Vec *v, int value) {
    if (v->len == v->cap) {
        size_t new_cap = v->cap ? v->cap * 2 : 4;
        int *p = realloc(v->data, new_cap * sizeof *p);
        if (!p) return -1;
        v->data = p;
        v->cap = new_cap;
    }
    v->data[v->len++] = value;
    return 0;
}

int main(void) {
    Vec v = {0};
    for (int i = 1; i <= 10; i++)
        if (vec_push(&v, i * i) != 0) return 1;

    printf("len=%zu cap=%zu last=%d\n", v.len, v.cap, v.data[v.len - 1]);
    free(v.data);
    return 0;
}`,
      out: "len=10 cap=16 last=100\n",
      tip: R`Doubling makes pushing <b>amortised O(1)</b>: the occasional expensive copy is spread across many cheap pushes.`
    },
    {
      title: "The memory bug zoo",
      body: R`
<table>
<tr><td><b>Leak</b></td><td>forgot to free, so memory use grows forever</td></tr>
<tr><td><b>Use-after-free</b></td><td>using memory after freeing it</td></tr>
<tr><td><b>Double free</b></td><td>freeing the same block twice, which corrupts the heap</td></tr>
<tr><td><b>Dangling pointer</b></td><td>a pointer to memory that is no longer valid</td></tr>
<tr><td><b>Heap overflow</b></td><td>writing past the end of an allocation</td></tr>
<tr><td><b>Uninitialised read</b></td><td>malloc'd memory holds garbage</td></tr>
</table>`,
      code: R`char *p = malloc(10);
free(p);
p[0] = 'x';      // use-after-free
free(p);         // double free

char *q = malloc(4);
strcpy(q, "hello");   // heap overflow: needs 6 bytes
q = malloc(8);        // leak: the first block is lost forever`,
      run: false,
      tip: R`Defensive habits: set pointers to <code>NULL</code> after <code>free</code> (<code>free(NULL)</code> is a safe no-op), and make clear which part of the code <b>owns</b> each allocation.`
    },
    {
      title: "Tools: sanitizers & Valgrind",
      body: R`<p>Professionals don't hunt memory bugs by staring at code. They let tools find them:</p>`,
      code: R`# AddressSanitizer: catches overflows, use-after-free, leaks
gcc -g -fsanitize=address,undefined -Wall -Wextra prog.c -o prog
./prog

# Valgrind: no recompile needed, slower but thorough
gcc -g prog.c -o prog
valgrind --leak-check=full ./prog`,
      lang: "sh",
      tip: R`Make <code>-fsanitize=address,undefined</code> your default for debug builds. It turns silent corruption into a clear report with a stack trace and line numbers.`
    }
  ],
  quiz: [
    { q: "What does malloc return when it fails?", opts: ["0xFFFFFFFF", "NULL", "It exits the program", "A pointer to zeroed memory"], a: 1, why: "Always check malloc's result against NULL." },
    { q: "Why is `p = realloc(p, n);` risky?", opts: ["realloc frees p twice", "If realloc fails it returns NULL and the original block leaks", "It's not risky", "realloc can't shrink"], a: 1, why: "Assign to a temporary, check it, then overwrite p." },
    { q: "Which memory region holds local variables?", opts: ["Heap", "Stack", "BSS", "Text"], a: 1, why: "Locals live in the function's stack frame." },
    { q: "Which difference between calloc and malloc is true?", opts: ["calloc is faster", "calloc zeroes the memory", "calloc allocates on the stack", "calloc never fails"], a: 1, why: "calloc zero-initialises and checks the count×size multiplication for overflow." }
  ]
});

COURSE.push({
  title: "Structs, Unions & Enums",
  level: "Intermediate",
  icon: "🏗️",
  cards: [
    {
      title: "struct: your own data types",
      body: R`<p>A <code>struct</code> groups related variables, called <b>members</b>, under one name:</p>`,
      code: R`#include <stdio.h>

struct Point {
    double x;
    double y;
};

int main(void) {
    struct Point a = {1.0, 2.0};
    struct Point b = {.y = 5.0, .x = 3.0};   // designated initialisers
    struct Point c = a;                       // structs copy by value

    c.x = 10.0;
    printf("a=(%.1f, %.1f) b=(%.1f, %.1f) c.x=%.1f\n",
           a.x, a.y, b.x, b.y, c.x);
    return 0;
}`,
      out: "a=(1.0, 2.0) b=(3.0, 5.0) c.x=10.0\n"
    },
    {
      title: "typedef",
      body: R`<p><code>typedef</code> creates an alias for a type, so you can write <code>Point</code> instead of <code>struct Point</code>:</p>`,
      code: R`#include <stdio.h>

typedef struct {
    char name[32];
    int age;
    double gpa;
} Student;

typedef unsigned char byte;

int main(void) {
    Student s = {"Linus", 21, 3.8};
    byte b = 200;
    printf("%s (%d) GPA %.1f, b=%u\n", s.name, s.age, s.gpa, b);
    return 0;
}`,
      out: "Linus (21) GPA 3.8, b=200\n"
    },
    {
      title: "Pointers to structs: the -> operator",
      body: R`<p>Passing big structs by value copies every byte, so pass a <b>pointer</b> instead. <code>p-&gt;member</code> is shorthand for <code>(*p).member</code>.</p>`,
      code: R`#include <stdio.h>

typedef struct {
    char owner[32];
    double balance;
} Account;

void deposit(Account *acc, double amount) {
    acc->balance += amount;          // same as (*acc).balance
}

void print_account(const Account *acc) {
    printf("%s: %.2f\n", acc->owner, acc->balance);
}

int main(void) {
    Account a = {"Grace", 100.0};
    deposit(&a, 50.25);
    print_account(&a);
    return 0;
}`,
      out: "Grace: 150.25\n"
    },
    {
      title: "Arrays of structs",
      body: R`<p>Combine arrays and structs to build simple in-memory tables:</p>`,
      code: R`#include <stdio.h>

typedef struct { const char *name; int year; } Lang;

int main(void) {
    Lang langs[] = {
        {"C", 1972}, {"C++", 1985}, {"Python", 1991}, {"Rust", 2015}
    };
    size_t n = sizeof langs / sizeof langs[0];

    const Lang *oldest = &langs[0];
    for (size_t i = 0; i < n; i++) {
        printf("%-7s %d\n", langs[i].name, langs[i].year);
        if (langs[i].year < oldest->year) oldest = &langs[i];
    }
    printf("oldest: %s\n", oldest->name);
    return 0;
}`,
      out: "C       1972\nC++     1985\nPython  1991\nRust    2015\noldest: C\n"
    },
    {
      title: "enum: named constants",
      body: R`<p>An <code>enum</code> gives readable names to a set of related integer constants. Unless you say otherwise, values count up from 0.</p>`,
      code: R`#include <stdio.h>

typedef enum { RED, GREEN, BLUE, COLOR_COUNT } Color;
typedef enum { HTTP_OK = 200, HTTP_NOT_FOUND = 404 } HttpStatus;

const char *color_name(Color c) {
    static const char *names[COLOR_COUNT] = {"red", "green", "blue"};
    return (c >= 0 && c < COLOR_COUNT) ? names[c] : "?";
}

int main(void) {
    for (Color c = RED; c < COLOR_COUNT; c++)
        printf("%d=%s ", c, color_name(c));
    printf("\n%d\n", HTTP_NOT_FOUND);
    return 0;
}`,
      out: "0=red 1=green 2=blue \n404\n",
      cflags: "-Wno-type-limits",
      tip: R`A trailing <code>_COUNT</code> entry gives you the number of values for free. With <code>-Wall</code>, a <code>switch</code> over an enum warns you when you forget a case.`
    },
    {
      title: "union & tagged unions",
      body: R`<p>A <code>union</code>'s members all <b>share the same memory</b>, so only one of them is valid at a time. Pair a union with an enum <b>tag</b> that records which member is active, and you get a variant type, the basis of interpreters and JSON parsers.</p>`,
      code: R`#include <stdio.h>

typedef enum { T_INT, T_DOUBLE, T_STR } Tag;

typedef struct {
    Tag tag;
    union {
        int i;
        double d;
        const char *s;
    } as;
} Value;

void print_value(Value v) {
    switch (v.tag) {
        case T_INT:    printf("int %d\n", v.as.i); break;
        case T_DOUBLE: printf("double %.2f\n", v.as.d); break;
        case T_STR:    printf("string \"%s\"\n", v.as.s); break;
    }
}

int main(void) {
    Value vals[] = {
        {T_INT, {.i = 42}}, {T_DOUBLE, {.d = 2.5}}, {T_STR, {.s = "hi"}}
    };
    for (int i = 0; i < 3; i++) print_value(vals[i]);
    printf("sizeof(Value) = %zu\n", sizeof(Value));
    return 0;
}`,
      out: "int 42\ndouble 2.50\nstring \"hi\"\nsizeof(Value) = 16\n",
      outNote: "on a 64-bit machine"
    },
    {
      title: "Padding & alignment",
      body: R`<p>CPUs read data fastest at <b>aligned</b> addresses: a 4-byte int at a multiple of 4, an 8-byte double at a multiple of 8. To keep members aligned, the compiler inserts invisible <b>padding</b> bytes, so a struct can be bigger than the sum of its parts.</p>`,
      code: R`#include <stdio.h>
#include <stddef.h>

struct Bad  { char a; double b; char c; };   // 1 + 7pad + 8 + 1 + 7pad
struct Good { double b; char a; char c; };   // 8 + 1 + 1 + 6pad

int main(void) {
    printf("Bad:  %zu bytes\n", sizeof(struct Bad));
    printf("Good: %zu bytes\n", sizeof(struct Good));
    printf("offset of Bad.b = %zu\n", offsetof(struct Bad, b));
    return 0;
}`,
      out: "Bad:  24 bytes\nGood: 16 bytes\noffset of Bad.b = 8\n",
      outNote: "on x86-64",
      tip: R`Order members from <b>largest to smallest</b> to cut padding. With millions of structs that saves real memory and cache space.`
    },
    {
      title: "Bit fields",
      body: R`<p>Bit fields pack several small values into the bits of a single integer. They're common in hardware registers and compact flag sets.</p>`,
      code: R`#include <stdio.h>

struct Flags {
    unsigned int visible  : 1;
    unsigned int editable : 1;
    unsigned int priority : 3;   // 0..7
};

int main(void) {
    struct Flags f = {.visible = 1, .priority = 5};
    f.editable = 1;
    printf("v=%u e=%u p=%u size=%zu\n",
           f.visible, f.editable, f.priority, sizeof f);
    return 0;
}`,
      out: "v=1 e=1 p=5 size=4\n",
      warn: R`The bit order and layout of bit fields are <b>implementation-defined</b>. For file formats and network packets, use explicit masks and shifts instead.`
    }
  ],
  quiz: [
    { q: "`p->x` is equivalent to…", opts: ["*p.x", "(*p).x", "&p.x", "p.x"], a: 1, why: "-> dereferences the pointer, then selects the member." },
    { q: "Why might `sizeof(struct S)` exceed the sum of its members?", opts: ["Compiler bug", "Padding inserted for alignment", "Hidden vtable", "Debug info"], a: 1, why: "Members are aligned to their natural boundaries, adding padding." },
    { q: "In a union, how many members hold a valid value at once?", opts: ["All of them", "One", "Two", "None"], a: 1, why: "All members overlap in memory; writing one overwrites the others." },
    { q: "Default value of the first enum constant?", opts: ["1", "0", "-1", "Undefined"], a: 1, why: "Enumerators start at 0 and increase by 1 unless specified." }
  ]
});
})();
