/* C Mastery — course content, part 1 (Modules 1–5: Beginner) */
window.COURSE = window.COURSE || [];
(function () {
const R = String.raw;

COURSE.push({
  title: "Getting Started",
  level: "Beginner",
  icon: "🚀",
  cards: [
    {
      title: "Why learn C?",
      body: R`
<p>C was created by <b>Dennis Ritchie</b> at Bell Labs in 1972 to write the Unix operating system. Fifty years later it still runs the world:</p>
<ul>
  <li>Operating system kernels — Linux, most of Windows and macOS internals</li>
  <li>Embedded devices — microwaves, cars, routers, pacemakers</li>
  <li>Databases and runtimes — SQLite, Redis, PostgreSQL, the Python interpreter</li>
</ul>
<p>C is a <b>small</b> language with very few rules, but it hides almost nothing. You manage memory yourself and see how data really sits in bytes. Learn C and every other language starts to make sense.</p>`,
      tip: R`You don't need any programming background for this course. Swipe left (or press →) to move to the next card.`
    },
    {
      title: "How a C program becomes runnable",
      body: R`
<p>C is a <b>compiled</b> language. You write human-readable <i>source code</i> in a <code>.c</code> file, and a <b>compiler</b> turns it into a machine-code <i>executable</i>. It happens in four stages:</p>
<ol>
  <li><b>Preprocess</b> — handles lines that start with <code>#</code> (pastes in headers, expands macros)</li>
  <li><b>Compile</b> — turns C into assembly language</li>
  <li><b>Assemble</b> — turns assembly into an object file (<code>.o</code>) of machine code</li>
  <li><b>Link</b> — joins your object files with libraries into one executable</li>
</ol>
<p>The command <code>gcc</code> runs all four for you. You can also stop after any stage to see what it produced:</p>`,
      code: R`gcc -E hello.c -o hello.i   # 1. preprocess only
gcc -S hello.c -o hello.s   # 2. compile to assembly
gcc -c hello.c -o hello.o   # 3. assemble to object file
gcc hello.o -o hello        # 4. link into an executable`,
      lang: "sh"
    },
    {
      title: "Your first program: Hello, World!",
      body: R`<p>Every C journey starts here. Type this into a file named <code>hello.c</code>:</p>`,
      code: R`#include <stdio.h>

int main(void) {
    printf("Hello, World!\n");
    return 0;
}`,
      out: "Hello, World!\n",
      tip: R`<code>\n</code> is an <i>escape sequence</i> meaning “newline”. Without it the shell prompt would end up on the same line as your text.`
    },
    {
      title: "Anatomy of a C program",
      body: R`
<ul>
  <li><code>#include &lt;stdio.h&gt;</code> — pulls in the <b>st</b>andar<b>d</b> <b>i</b>nput/<b>o</b>utput library so we can use <code>printf</code>.</li>
  <li><code>int main(void)</code> — every program starts running at <code>main</code>. It returns an <code>int</code> to the operating system and here takes no arguments (<code>void</code>).</li>
  <li><code>{ ... }</code> — curly braces group statements into a <b>block</b>.</li>
  <li><code>printf(...);</code> — a <b>statement</b>. Every statement ends with a semicolon <code>;</code>.</li>
  <li><code>return 0;</code> — tells the OS the program succeeded. Any non-zero value means “something went wrong”.</li>
</ul>`,
      warn: R`C is <b>case-sensitive</b>: <code>Main</code>, <code>MAIN</code> and <code>main</code> are three different names. Only <code>main</code> starts your program.`
    },
    {
      title: "Compile & run it",
      body: R`
<p>You need a C compiler. Pick one:</p>
<ul>
  <li><b>Linux:</b> <code>sudo apt install build-essential</code></li>
  <li><b>macOS:</b> <code>xcode-select --install</code> (gives you <code>clang</code>, also callable as <code>gcc</code>)</li>
  <li><b>Windows:</b> install WSL (Ubuntu) or MSYS2</li>
  <li><b>No install:</b> use an online compiler such as onlinegdb.com or godbolt.org</li>
</ul>
<p>Then in a terminal:</p>`,
      code: R`gcc -std=c17 -Wall -Wextra hello.c -o hello
./hello`,
      lang: "sh",
      tip: R`Get into the habit now: <code>-Wall -Wextra</code> turn on warnings. Warnings point out real bugs, so treat them as errors.`
    },
    {
      title: "Comments and style",
      body: R`<p>Comments are notes for humans. The compiler ignores them.</p>`,
      code: R`#include <stdio.h>

/* A block comment
   can span many lines. */

int main(void) {
    // A line comment runs to the end of the line (C99 and later)
    printf("Comments are ignored\n"); // they can follow code too
    return 0;
}`,
      out: "Comments are ignored\n",
      tip: R`Good comments explain <b>why</b>, not <b>what</b>. <code>// retry because the sensor is flaky at boot</code> beats <code>// call function</code>.`
    }
  ],
  quiz: [
    { q: "Where does every C program start executing?", opts: ["The first line of the file", "The main function", "The #include line", "Whichever function is defined first"], a: 1, why: "The OS calls main(); everything else runs because main calls it." },
    { q: "What does `return 0;` from main mean?", opts: ["The program crashed", "Return the number zero to printf", "Success, reported to the operating system", "Restart the program"], a: 2, why: "By convention 0 means success and non-zero means failure." },
    { q: "Which stage handles the `#include` lines?", opts: ["Preprocessor", "Assembler", "Linker", "Loader"], a: 0, why: "Lines starting with # are preprocessor directives, processed before real compilation." }
  ]
});

COURSE.push({
  title: "Variables & Data Types",
  level: "Beginner",
  icon: "📦",
  cards: [
    {
      title: "Variables: named boxes in memory",
      body: R`
<p>A <b>variable</b> is a named piece of memory that holds a value. In C you must declare its <b>type</b> before you use it:</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int age = 25;          // declare and initialise
    int year;              // declare only
    year = 2026;           // assign later
    age = age + 1;         // update using the old value

    printf("Age %d in %d\n", age, year);
    return 0;
}`,
      out: "Age 26 in 2026\n",
      warn: R`A local variable you never initialise holds <b>garbage</b> — whatever bytes happened to be there. Always give variables a starting value.`
    },
    {
      title: "The basic types",
      body: R`
<table>
<tr><th>Type</th><th>Holds</th><th>Example</th></tr>
<tr><td><code>char</code></td><td>one byte, often a character</td><td><code>'A'</code></td></tr>
<tr><td><code>int</code></td><td>whole number</td><td><code>42</code></td></tr>
<tr><td><code>long</code> / <code>long long</code></td><td>bigger whole numbers</td><td><code>9000000000LL</code></td></tr>
<tr><td><code>float</code></td><td>decimal, ~7 digits precision</td><td><code>3.14f</code></td></tr>
<tr><td><code>double</code></td><td>decimal, ~15 digits precision</td><td><code>3.14159</code></td></tr>
<tr><td><code>bool</code></td><td>true / false (<code>&lt;stdbool.h&gt;</code>)</td><td><code>true</code></td></tr>
</table>
<p>Sizes vary by platform. <code>sizeof</code> tells you how many bytes a type uses:</p>`,
      code: R`#include <stdio.h>

int main(void) {
    printf("char:      %zu\n", sizeof(char));
    printf("short:     %zu\n", sizeof(short));
    printf("int:       %zu\n", sizeof(int));
    printf("long:      %zu\n", sizeof(long));
    printf("long long: %zu\n", sizeof(long long));
    printf("float:     %zu\n", sizeof(float));
    printf("double:    %zu\n", sizeof(double));
    return 0;
}`,
      out: "char:      1\nshort:     2\nint:       4\nlong:      8\nlong long: 8\nfloat:     4\ndouble:    8\n",
      outNote: "on a typical 64-bit Linux machine",
      tip: R`Default to <code>double</code> for decimals. <code>float</code> saves memory, but its precision runs out quickly.`
    },
    {
      title: "signed vs unsigned",
      body: R`
<p>Integer types are <b>signed</b> by default: they can hold negative numbers. Add <code>unsigned</code> to give up negatives in exchange for twice the positive range.</p>
<p><code>&lt;limits.h&gt;</code> defines the exact limits for your platform:</p>`,
      code: R`#include <stdio.h>
#include <limits.h>

int main(void) {
    printf("int:          %d to %d\n", INT_MIN, INT_MAX);
    printf("unsigned int: 0 to %u\n", UINT_MAX);
    printf("char bits:    %d\n", CHAR_BIT);
    return 0;
}`,
      out: "int:          -2147483648 to 2147483647\nunsigned int: 0 to 4294967295\nchar bits:    8\n",
      warn: R`Mixing signed and unsigned in a comparison is a classic bug: <code>-1 &lt; 1u</code> is <b>false</b>, because -1 is converted to a huge unsigned number.`
    },
    {
      title: "printf format specifiers",
      body: R`<p><code>printf</code> fills each <code>%</code> placeholder with the next argument. The specifier must match the argument's type:</p>
<table>
<tr><th>Spec</th><th>Type</th></tr>
<tr><td><code>%d</code> / <code>%i</code></td><td>int</td></tr>
<tr><td><code>%u</code></td><td>unsigned int</td></tr>
<tr><td><code>%ld</code> / <code>%lld</code></td><td>long / long long</td></tr>
<tr><td><code>%f</code> / <code>%.2f</code></td><td>double (2 decimals)</td></tr>
<tr><td><code>%c</code></td><td>char</td></tr>
<tr><td><code>%s</code></td><td>string</td></tr>
<tr><td><code>%x</code></td><td>hex</td></tr>
<tr><td><code>%p</code></td><td>pointer (address)</td></tr>
<tr><td><code>%zu</code></td><td>size_t (from sizeof)</td></tr>
<tr><td><code>%%</code></td><td>a literal %</td></tr>
</table>`,
      code: R`#include <stdio.h>

int main(void) {
    int n = 255;
    double pi = 3.14159265;
    char grade = 'A';

    printf("[%d] [%5d] [%-5d] [%05d]\n", n, n, n, n);
    printf("hex: %x  HEX: %X  octal: %o\n", n, n, n);
    printf("pi: %f  %.2f  %8.3f\n", pi, pi, pi);
    printf("grade: %c  name: %s  100%%\n", grade, "Ada");
    return 0;
}`,
      out: "[255] [  255] [255  ] [00255]\nhex: ff  HEX: FF  octal: 377\npi: 3.141593  3.14     3.142\ngrade: A  name: Ada  100%\n",
      tip: R`A width like <code>%5d</code> pads to 5 characters, <code>-</code> left-aligns and <code>0</code> pads with zeros. They're handy for printing tables.`
    },
    {
      title: "Reading input with scanf",
      body: R`<p><code>scanf</code> reads formatted input. Pass the <b>address</b> of each variable with <code>&amp;</code> so scanf can store into it:</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int age;
    double height;

    printf("Enter age and height: ");
    if (scanf("%d %lf", &age, &height) != 2) {
        printf("Invalid input!\n");
        return 1;
    }
    printf("You are %d years old and %.2f m tall\n", age, height);
    return 0;
}`,
      run: false,
      warn: R`Always check scanf's <b>return value</b>, which is the number of items it read successfully. Note that <code>double</code> uses <code>%lf</code> in scanf but plain <code>%f</code> in printf.`
    },
    {
      title: "Constants and literals",
      body: R`
<p>Mark a variable <code>const</code> when it should never change. The compiler will then reject any assignment to it.</p>
<p>Literals can be written in several bases and with suffixes:</p>
<ul>
<li><code>42</code> decimal · <code>0x2A</code> hex · <code>052</code> <b>octal</b> (!) · <code>0b101010</code> binary (C23)</li>
<li><code>42u</code> unsigned · <code>42L</code> long · <code>42ULL</code> unsigned long long</li>
<li><code>3.0</code> double · <code>3.0f</code> float</li>
<li><code>'A'</code> character · <code>"A"</code> string (two bytes: 'A' and '\0')</li>
</ul>`,
      code: R`#include <stdio.h>

#define MAX_USERS 100      // preprocessor constant (text substitution)

int main(void) {
    const double TAX_RATE = 0.18;   // typed constant
    int x = 010;                    // octal! this is 8, not 10

    printf("%d users, tax %.0f%%, x = %d\n", MAX_USERS, TAX_RATE * 100, x);
    // TAX_RATE = 0.2;  // error: assignment of read-only variable
    return 0;
}`,
      out: "100 users, tax 18%, x = 8\n",
      warn: R`A leading zero makes a number octal. <code>int zip = 01234;</code> silently becomes 668.`
    },
    {
      title: "Type conversion & casting",
      body: R`
<p>When an operation mixes types, C converts them automatically (<b>implicit conversion</b>). The big trap: <b>dividing two integers gives an integer</b>, and the fractional part is thrown away.</p>
<p>A <b>cast</b> <code>(type)value</code> converts explicitly:</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int a = 7, b = 2;

    printf("%d\n", a / b);              // 3   (integer division)
    printf("%f\n", a / b * 1.0);        // 3.0 (too late, already truncated)
    printf("%f\n", (double)a / b);      // 3.5 (cast first)

    double d = 9.99;
    int i = (int)d;                     // truncates toward zero
    printf("%d\n", i);

    char c = 'A';
    printf("%c has code %d\n", c, c);   // chars are small integers
    return 0;
}`,
      out: "3\n3.000000\n3.500000\n9\nA has code 65\n"
    },
    {
      title: "Fixed-width integers",
      body: R`
<p>The size of <code>int</code> or <code>long</code> depends on the platform. For file formats, network protocols and hardware registers you need an <b>exact</b> size. <code>&lt;stdint.h&gt;</code> provides one:</p>
<ul>
<li><code>int8_t int16_t int32_t int64_t</code> — signed, exact width</li>
<li><code>uint8_t … uint64_t</code> — unsigned, exact width</li>
<li><code>size_t</code> — unsigned type for sizes and indexes (from <code>&lt;stddef.h&gt;</code>)</li>
</ul>`,
      code: R`#include <stdio.h>
#include <stdint.h>
#include <inttypes.h>   // PRId64 etc. for printf

int main(void) {
    uint8_t  byte  = 255;
    int32_t  temp  = -40;
    uint64_t big   = 18446744073709551615u;

    printf("%u %" PRId32 " %" PRIu64 "\n", byte, temp, big);
    return 0;
}`,
      out: "255 -40 18446744073709551615\n",
      tip: R`Professional code uses <code>size_t</code> for array indexes and lengths, and <code>stdint.h</code> types wherever the size matters.`
    },
    {
      title: "Overflow: when numbers run out of room",
      body: R`
<ul>
<li><b>Unsigned</b> overflow is well defined: it wraps around modulo 2<sup>N</sup>.</li>
<li><b>Signed</b> overflow is <b>undefined behavior</b>. The program may do <i>anything</i>, and optimizing compilers really do exploit this.</li>
</ul>`,
      code: R`#include <stdio.h>
#include <limits.h>

int main(void) {
    unsigned char u = 255;
    u = u + 1;                 // wraps to 0 — defined
    printf("%u\n", u);

    unsigned int x = 0;
    x = x - 1;                 // wraps to UINT_MAX — defined
    printf("%u\n", x);

    int s = INT_MAX;
    // s = s + 1;              // UNDEFINED BEHAVIOR — never do this
    if (s > INT_MAX - 1)       // check *before* the operation instead
        printf("would overflow!\n");
    return 0;
}`,
      out: "0\n4294967295\nwould overflow!\n"
    }
  ],
  quiz: [
    { q: "What does `7 / 2` evaluate to in C?", opts: ["3.5", "3", "4", "Compile error"], a: 1, why: "Both operands are int, so this is integer division and the remainder is discarded." },
    { q: "Which printf specifier prints a size_t value?", opts: ["%d", "%lu", "%zu", "%s"], a: 2, why: "%zu is the portable specifier for size_t, the type sizeof returns." },
    { q: "What is the value of `int x = 012;`?", opts: ["12", "10", "1.2", "Error"], a: 1, why: "A leading 0 means octal: 1×8 + 2 = 10." },
    { q: "Adding 1 to INT_MAX…", opts: ["Wraps to INT_MIN, guaranteed", "Is undefined behavior", "Gives a compile error", "Saturates at INT_MAX"], a: 1, why: "Signed overflow is UB. Only unsigned arithmetic is guaranteed to wrap." }
  ]
});

COURSE.push({
  title: "Operators & Expressions",
  level: "Beginner",
  icon: "➗",
  cards: [
    {
      title: "Arithmetic operators",
      body: R`<p><code>+  -  *  /  %</code>. The <b>modulo</b> operator <code>%</code> gives the remainder of an integer division and only works on integers.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    printf("%d %d %d\n", 17 / 5, 17 % 5, -17 / 5);
    printf("%d\n", -17 % 5);         // sign follows the left operand

    int seconds = 3725;
    printf("%dh %dm %ds\n", seconds / 3600, (seconds % 3600) / 60, seconds % 60);

    int n = 42;
    printf("%d is %s\n", n, n % 2 == 0 ? "even" : "odd");
    return 0;
}`,
      out: "3 2 -3\n-2\n1h 2m 5s\n42 is even\n",
      tip: R`Integer division truncates <b>toward zero</b> (guaranteed since C99), so <code>-17 / 5</code> is -3, not -4.`
    },
    {
      title: "Increment & decrement",
      body: R`
<p><code>++x</code> (<b>pre</b>-increment) adds 1 and then gives you the new value.<br><code>x++</code> (<b>post</b>-increment) gives you the old value and then adds 1.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int a = 5, b = 5;
    int x = ++a;   // a becomes 6, x = 6
    int y = b++;   // y = 5, then b becomes 6
    printf("a=%d x=%d | b=%d y=%d\n", a, x, b, y);
    return 0;
}`,
      out: "a=6 x=6 | b=6 y=5\n",
      warn: R`Never modify the same variable twice in one expression. <code>i = i++ + ++i;</code> is <b>undefined behavior</b>, not a puzzle with a correct answer.`
    },
    {
      title: "Comparison & logical operators",
      body: R`
<p>Comparisons: <code>==  !=  &lt;  &gt;  &lt;=  &gt;=</code>. Logic: <code>&amp;&amp;</code> (and), <code>||</code> (or), <code>!</code> (not).</p>
<p>C has no separate boolean result. A comparison gives an <code>int</code>: <b>1</b> for true and <b>0</b> for false. Any non-zero value counts as true.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int age = 20;
    printf("%d %d\n", age > 18, age == 18);
    printf("%d\n", age >= 13 && age <= 19);   // is teen?
    printf("%d\n", !(age > 18));

    if (age = 0)   // BUG: assignment, not comparison! (gcc -Wall warns)
        printf("never printed\n");
    printf("age is now %d\n", age);
    return 0;
}`,
      out: "1 0\n0\n0\nage is now 0\n",
      cflags: "-Wno-parentheses",
      warn: R`<code>=</code> assigns and <code>==</code> compares. Mixing them up is one of the most common C bugs, and <code>-Wall</code> catches it.`
    },
    {
      title: "Short-circuit evaluation",
      body: R`
<p><code>&amp;&amp;</code> stops as soon as one side is false, and <code>||</code> stops as soon as one side is true. The right side is <b>not evaluated at all</b>. Programmers rely on this for safety checks:</p>`,
      code: R`#include <stdio.h>

int check(const char *name, int result) {
    printf("checking %s\n", name);
    return result;
}

int main(void) {
    if (check("A", 0) && check("B", 1))
        printf("both true\n");

    int count = 0, total = 10;
    // division only happens if count != 0 — no divide-by-zero
    if (count != 0 && total / count > 2)
        printf("big average\n");
    printf("done\n");
    return 0;
}`,
      out: "checking A\ndone\n"
    },
    {
      title: "Bitwise operators",
      body: R`
<p>These operate on the individual bits of an integer. You'll meet them in embedded code, flags, graphics and compression.</p>
<table>
<tr><td><code>a &amp; b</code></td><td>AND — 1 where both bits are 1</td></tr>
<tr><td><code>a | b</code></td><td>OR — 1 where either bit is 1</td></tr>
<tr><td><code>a ^ b</code></td><td>XOR — 1 where the bits differ</td></tr>
<tr><td><code>~a</code></td><td>NOT — flip every bit</td></tr>
<tr><td><code>a &lt;&lt; n</code></td><td>shift left (×2<sup>n</sup>)</td></tr>
<tr><td><code>a &gt;&gt; n</code></td><td>shift right (÷2<sup>n</sup> for unsigned)</td></tr>
</table>`,
      code: R`#include <stdio.h>

void bits(unsigned char x) {
    for (int i = 7; i >= 0; i--)
        putchar((x >> i) & 1 ? '1' : '0');
    putchar('\n');
}

int main(void) {
    unsigned char a = 0xCA, b = 0x0F;   // 11001010, 00001111
    bits(a & b);
    bits(a | b);
    bits(a ^ b);
    bits((unsigned char)~a);
    bits(a << 1);
    bits(a >> 4);
    return 0;
}`,
      out: "00001010\n11001111\n11000101\n00110101\n10010100\n00001100\n",
      warn: R`Shift unsigned values only. Shifting a negative number, or shifting by at least the type's width, is undefined or implementation-defined.`
    },
    {
      title: "Compound assignment & precedence",
      body: R`
<p>Shorthand: <code>x += 5</code> means <code>x = x + 5</code>. The same works for <code>-= *= /= %= &amp;= |= ^= &lt;&lt;= &gt;&gt;=</code>.</p>
<p><b>Precedence</b> decides what binds first. A few rules to remember:</p>
<ul>
<li><code>* / %</code> bind tighter than <code>+ -</code></li>
<li>Comparisons bind tighter than <code>&amp;&amp;</code>, which binds tighter than <code>||</code></li>
<li>⚠️ <code>&amp; | ^</code> bind <b>looser</b> than <code>==</code>, so <code>x &amp; 1 == 0</code> means <code>x &amp; (1 == 0)</code></li>
</ul>`,
      code: R`#include <stdio.h>

int main(void) {
    int x = 10;
    x += 5;  x *= 2;  x -= 3;  x /= 3;  x %= 4;
    printf("x = %d\n", x);

    int flags = 6;
    printf("%d\n", (flags & 1) == 0);   // parentheses required!
    printf("%d\n", 2 + 3 * 4);          // 14, not 20
    return 0;
}`,
      out: "x = 1\n1\n14\n",
      tip: R`When in doubt, add parentheses. They cost nothing and make your intent obvious to the reader.`
    }
  ],
  quiz: [
    { q: "What does `x++` evaluate to if x is 4?", opts: ["5", "4", "It depends on the compiler", "1"], a: 1, why: "Post-increment yields the old value (4), then increments x to 5." },
    { q: "In `if (p != NULL && p->ok)`, when is `p->ok` read?", opts: ["Always", "Only if p != NULL is true", "Only if p is NULL", "Before the NULL check"], a: 1, why: "&& short-circuits: if the left side is false the right side never runs." },
    { q: "What is `5 ^ 3`?", opts: ["125", "8", "6", "2"], a: 2, why: "^ is XOR, not power: 101 ^ 011 = 110 = 6." },
    { q: "What does `-7 % 3` give in C99+?", opts: ["2", "-1", "1", "-2"], a: 1, why: "Division truncates toward zero (-7/3 = -2), so the remainder is -7 - (-6) = -1." }
  ]
});

COURSE.push({
  title: "Control Flow",
  level: "Beginner",
  icon: "🔀",
  cards: [
    {
      title: "if / else if / else",
      body: R`<p>Run code only when a condition is true:</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int score = 78;

    if (score >= 90) {
        printf("Grade A\n");
    } else if (score >= 75) {
        printf("Grade B\n");
    } else if (score >= 50) {
        printf("Grade C\n");
    } else {
        printf("Fail\n");
    }
    return 0;
}`,
      out: "Grade B\n",
      warn: R`Without braces, only the <b>next single statement</b> belongs to the <code>if</code>. Always use braces. Apple's famous “goto fail” SSL bug came from leaving them out.`
    },
    {
      title: "switch",
      body: R`<p><code>switch</code> picks a branch by matching an <b>integer</b> value against constant <code>case</code> labels. Execution <b>falls through</b> into the next case unless you <code>break</code>.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    char op = '*';
    int a = 6, b = 3;

    switch (op) {
        case '+': printf("%d\n", a + b); break;
        case '-': printf("%d\n", a - b); break;
        case '*': printf("%d\n", a * b); break;
        case '/':
            if (b != 0) printf("%d\n", a / b);
            break;
        default:  printf("unknown op\n");
    }

    int day = 6;
    switch (day) {
        case 6:            // intentional fall-through:
        case 7: printf("weekend\n"); break;
        default: printf("weekday\n");
    }
    return 0;
}`,
      out: "18\nweekend\n",
      tip: R`You can't switch on strings or doubles in C. Only integer types, chars and enums work.`
    },
    {
      title: "The ternary operator",
      body: R`<p><code>condition ? valueIfTrue : valueIfFalse</code> is a compact if/else that <b>produces a value</b>:</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int a = 12, b = 7;
    int max = (a > b) ? a : b;
    int items = 1;

    printf("max = %d\n", max);
    printf("%d item%s\n", items, items == 1 ? "" : "s");
    return 0;
}`,
      out: "max = 12\n1 item\n",
      tip: R`Use the ternary for short value choices. If you find yourself nesting ternaries, switch to if/else.`
    },
    {
      title: "while loop",
      body: R`<p>A <code>while</code> loop repeats as long as its condition stays true. The condition is checked <b>before</b> each pass.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int n = 1234, sum = 0;

    while (n > 0) {
        sum += n % 10;   // take the last digit
        n /= 10;         // drop the last digit
    }
    printf("digit sum = %d\n", sum);
    return 0;
}`,
      out: "digit sum = 10\n",
      warn: R`If the condition can never become false you have an <b>infinite loop</b>. Make sure every pass moves toward the exit.`
    },
    {
      title: "for loop",
      body: R`<p>The workhorse loop: <code>for (init; condition; step)</code>. It's ideal when you know how many times to repeat.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    for (int i = 1; i <= 5; i++) {
        printf("%d squared = %d\n", i, i * i);
    }

    // count down by 2
    for (int i = 10; i > 0; i -= 2)
        printf("%d ", i);
    printf("\n");
    return 0;
}`,
      out: "1 squared = 1\n2 squared = 4\n3 squared = 9\n4 squared = 16\n5 squared = 25\n10 8 6 4 2 \n",
      tip: R`A variable declared in the <code>for</code> header (C99+) exists only inside the loop. That keeps its scope tight.`
    },
    {
      title: "do-while loop",
      body: R`<p>A <code>do-while</code> loop runs its body <b>at least once</b> and checks the condition at the end. That makes it perfect for menus and input validation.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int choice;
    do {
        printf("1) Play  2) Settings  0) Quit\n> ");
        if (scanf("%d", &choice) != 1) return 1;
    } while (choice != 0);
    printf("Bye!\n");
    return 0;
}`,
      run: false
    },
    {
      title: "break & continue",
      body: R`<ul><li><code>break</code> exits the innermost loop (or switch) immediately.</li><li><code>continue</code> skips the rest of this pass and jumps to the next one.</li></ul>`,
      code: R`#include <stdio.h>

int main(void) {
    // print odd numbers, stop at the first number > 10 divisible by 7
    for (int i = 1; i < 100; i++) {
        if (i % 2 == 0) continue;
        if (i > 10 && i % 7 == 0) break;
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}`,
      out: "1 3 5 7 9 11 13 15 17 19 \n"
    },
    {
      title: "Nested loops",
      body: R`<p>A loop inside a loop: the inner loop runs completely for <b>every</b> pass of the outer loop. This is how you walk grids, tables and pairs.</p>`,
      code: R`#include <stdio.h>

int main(void) {
    int rows = 4;
    for (int r = 1; r <= rows; r++) {
        for (int s = 0; s < rows - r; s++) putchar(' ');
        for (int s = 0; s < 2 * r - 1; s++) putchar('*');
        putchar('\n');
    }
    return 0;
}`,
      out: "   *\n  ***\n *****\n*******\n",
      tip: R`To get out of several nested loops at once, either move them into a function and <code>return</code>, or use a flag variable. This is also one of the few places where a careful <code>goto</code> is acceptable.`
    }
  ],
  quiz: [
    { q: "How many times does the body of `do { } while (0);` run?", opts: ["0", "1", "Infinite", "Compile error"], a: 1, why: "do-while checks the condition after the body, so it always runs at least once." },
    { q: "What happens without `break` at the end of a switch case?", opts: ["Compile error", "The switch exits anyway", "Execution falls through into the next case", "The case repeats"], a: 2, why: "Fall-through is C's default; you must break explicitly." },
    { q: "Which can a `switch` NOT switch on?", opts: ["char", "int", "enum", "a string"], a: 3, why: "switch requires an integer-type expression; use strcmp chains for strings." }
  ]
});

COURSE.push({
  title: "Functions",
  level: "Beginner",
  icon: "🧩",
  cards: [
    {
      title: "Defining & calling functions",
      body: R`<p>A function is a named, reusable block of code. It takes <b>parameters</b> and can <b>return</b> a value:</p>
<p><code>returnType name(type param1, type param2) { body }</code></p>`,
      code: R`#include <stdio.h>

double area(double width, double height) {
    return width * height;
}

void greet(const char *name) {      // void = returns nothing
    printf("Hello, %s!\n", name);
}

int main(void) {
    greet("Ada");
    double a = area(3.0, 4.5);
    printf("area = %.1f\n", a);
    return 0;
}`,
      out: "Hello, Ada!\narea = 13.5\n",
      tip: R`Each function should do <b>one thing</b>. If you struggle to name a function, it's probably doing too much.`
    },
    {
      title: "Prototypes (declarations)",
      body: R`<p>C reads a file from top to bottom. To call a function that is defined further down, <b>declare</b> it first with a prototype: the signature followed by a semicolon.</p>`,
      code: R`#include <stdio.h>

int square(int x);            // prototype — "this exists, trust me"

int main(void) {
    printf("%d\n", square(9));
    return 0;
}

int square(int x) {           // definition
    return x * x;
}`,
      out: "81\n",
      tip: R`Prototypes usually live in <code>.h</code> header files, which is how one <code>.c</code> file calls functions that live in another. More on that in the Preprocessor module.`
    },
    {
      title: "Pass by value",
      body: R`<p>C passes arguments <b>by value</b>: the function receives a <i>copy</i>. Changing the copy never affects the caller's variable.</p>`,
      code: R`#include <stdio.h>

void try_to_double(int n) {
    n = n * 2;                          // modifies the local copy only
    printf("inside:  %d\n", n);
}

int main(void) {
    int value = 10;
    try_to_double(value);
    printf("outside: %d\n", value);     // still 10
    return 0;
}`,
      out: "inside:  20\noutside: 10\n",
      tip: R`To let a function change the caller's variable, pass its <b>address</b> (a pointer). That's coming up in the Pointers module.`
    },
    {
      title: "Scope & lifetime",
      body: R`
<ul>
<li><b>Block scope:</b> a variable declared inside <code>{ }</code> is visible only inside that block and disappears when the block ends.</li>
<li><b>File scope (global):</b> a variable declared outside every function is visible from that point to the end of the file and lives for the whole program.</li>
<li>An inner variable with the same name <b>shadows</b> the outer one.</li>
</ul>`,
      code: R`#include <stdio.h>

int counter = 0;                  // global: lives forever

void bump(void) { counter++; }

int main(void) {
    int x = 1;
    {
        int x = 2;                // shadows the outer x
        printf("inner x = %d\n", x);
    }
    printf("outer x = %d\n", x);

    bump(); bump();
    printf("counter = %d\n", counter);
    return 0;
}`,
      out: "inner x = 2\nouter x = 1\ncounter = 2\n",
      warn: R`Globals make programs hard to reason about, because any function can change them. Prefer passing data through parameters.`
    },
    {
      title: "static local variables",
      body: R`<p>A <code>static</code> local variable is initialised <b>once</b> and keeps its value between calls. Its scope stays private to the function.</p>`,
      code: R`#include <stdio.h>

int next_id(void) {
    static int id = 0;    // initialised once, survives between calls
    return ++id;
}

int main(void) {
    printf("%d ", next_id());
    printf("%d ", next_id());
    printf("%d\n", next_id());
    return 0;
}`,
      out: "1 2 3\n"
    },
    {
      title: "Recursion",
      body: R`<p>A function that calls <b>itself</b>. Every recursive function needs:</p>
<ol><li>a <b>base case</b> that stops the recursion</li><li>a <b>recursive step</b> that moves toward the base case</li></ol>`,
      code: R`#include <stdio.h>

unsigned long long factorial(unsigned n) {
    if (n <= 1) return 1;              // base case
    return n * factorial(n - 1);       // recursive step
}

int fib(int n) {
    return n < 2 ? n : fib(n - 1) + fib(n - 2);
}

int main(void) {
    printf("10! = %llu\n", factorial(10));
    for (int i = 0; i < 10; i++) printf("%d ", fib(i));
    printf("\n");
    return 0;
}`,
      out: "10! = 3628800\n0 1 1 2 3 5 8 13 21 34 \n",
      warn: R`Each call uses stack memory. If the recursion goes too deep you get a <b>stack overflow</b> crash. Naive <code>fib</code> is also exponentially slow, so a loop is often the better tool.`
    }
  ],
  quiz: [
    { q: "A function receives `int n` and sets `n = 0`. What happens to the caller's variable?", opts: ["It becomes 0", "Nothing — the function got a copy", "Compile error", "Undefined behavior"], a: 1, why: "C is pass-by-value; only the local copy changes." },
    { q: "What does a `static` local variable do?", opts: ["Makes it constant", "Keeps its value between calls", "Makes it global to all files", "Allocates it on the heap"], a: 1, why: "static gives the variable static storage duration while keeping it local in scope." },
    { q: "What is a function prototype?", opts: ["A draft function", "A declaration of a function's signature before its use", "A function with no body that does nothing", "A macro"], a: 1, why: "It tells the compiler the function's name, parameter types and return type." }
  ]
});
})();
