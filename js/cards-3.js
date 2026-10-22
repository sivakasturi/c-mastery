/* C Mastery — course content, part 3 (Modules 10–14: Advanced → Pro) */
window.COURSE = window.COURSE || [];
(function () {
const R = String.raw;

COURSE.push({
  title: "Files & Program I/O",
  level: "Advanced",
  icon: "📁",
  cards: [
    {
      title: "Command-line arguments",
      body: R`<p><code>main</code> can receive the words typed after the program's name:</p>
<ul><li><code>argc</code> is the argument count (including the program name)</li><li><code>argv</code> is an array of strings; <code>argv[0]</code> is the program name and <code>argv[argc]</code> is <code>NULL</code></li></ul>`,
      code: R`#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    if (argc < 3) {
        fprintf(stderr, "usage: %s <a> <b>\n", argv[0]);
        return EXIT_FAILURE;
    }
    long a = strtol(argv[1], NULL, 10);
    long b = strtol(argv[2], NULL, 10);
    printf("%ld + %ld = %ld\n", a, b, a + b);
    return EXIT_SUCCESS;
}`,
      args: ["20", "22"],
      out: "20 + 22 = 42\n",
      outNote: "run as ./add 20 22",
      tip: R`Prefer <code>strtol</code> / <code>strtod</code> over <code>atoi</code>. They can report bad input through their end-pointer argument and <code>errno</code>, while <code>atoi</code> just returns 0.`
    },
    {
      title: "Opening and closing files",
      body: R`<p><code>fopen(path, mode)</code> returns a <code>FILE *</code>, or <code>NULL</code> on failure. The common modes are:</p>
<table>
<tr><td><code>"r"</code></td><td>read (the file must exist)</td></tr>
<tr><td><code>"w"</code></td><td>write (creates or <b>truncates</b>)</td></tr>
<tr><td><code>"a"</code></td><td>append</td></tr>
<tr><td><code>"r+"</code></td><td>read and write</td></tr>
<tr><td><code>"rb"/"wb"</code></td><td>binary mode (matters on Windows)</td></tr>
</table>`,
      code: R`#include <stdio.h>

int main(void) {
    FILE *f = fopen("notes.txt", "w");
    if (f == NULL) {
        perror("fopen");          // prints the reason, e.g. "Permission denied"
        return 1;
    }
    fprintf(f, "Line one\n");
    fprintf(f, "Value: %d\n", 42);
    fclose(f);                    // flushes buffers and releases the handle
    printf("saved\n");
    return 0;
}`,
      out: "saved\n"
    },
    {
      title: "Reading a text file line by line",
      body: R`<p>The standard loop: call <code>fgets</code> until it returns <code>NULL</code>.</p>`,
      code: R`#include <stdio.h>
#include <string.h>

int main(void) {
    FILE *out = fopen("data.txt", "w");
    if (!out) return 1;
    fputs("apple 3\nbanana 12\ncherry 7\n", out);
    fclose(out);

    FILE *in = fopen("data.txt", "r");
    if (!in) { perror("data.txt"); return 1; }

    char line[128], name[64];
    int qty, total = 0, lineno = 0;
    while (fgets(line, sizeof line, in)) {
        lineno++;
        if (sscanf(line, "%63s %d", name, &qty) == 2) {
            printf("%d: %s x%d\n", lineno, name, qty);
            total += qty;
        }
    }
    fclose(in);
    printf("total = %d\n", total);
    return 0;
}`,
      out: "1: apple x3\n2: banana x12\n3: cherry x7\ntotal = 22\n",
      tip: R`Read a whole line with <code>fgets</code>, then parse it with <code>sscanf</code>. That's far more robust than calling <code>fscanf</code> on the file directly. Also note the <code>%63s</code> width limit, which protects <code>name</code> from overflowing.`
    },
    {
      title: "Binary files: fread & fwrite",
      body: R`<p>Binary I/O copies raw bytes, such as whole structs or arrays, to and from disk. It's fast and compact.</p>`,
      code: R`#include <stdio.h>

typedef struct { int id; double score; } Record;

int main(void) {
    Record out[3] = {{1, 9.5}, {2, 7.25}, {3, 8.0}};

    FILE *f = fopen("records.bin", "wb");
    if (!f) return 1;
    size_t written = fwrite(out, sizeof out[0], 3, f);
    fclose(f);

    Record in[3];
    f = fopen("records.bin", "rb");
    if (!f) return 1;
    size_t got = fread(in, sizeof in[0], 3, f);
    fclose(f);

    printf("wrote %zu, read %zu\n", written, got);
    for (size_t i = 0; i < got; i++)
        printf("#%d -> %.2f\n", in[i].id, in[i].score);
    return 0;
}`,
      out: "wrote 3, read 3\n#1 -> 9.50\n#2 -> 7.25\n#3 -> 8.00\n",
      warn: R`Raw struct dumps aren't portable. Padding, endianness and type sizes differ between machines, so serialise field by field for files that move between systems.`
    },
    {
      title: "Error handling the C way",
      body: R`<p>C has no exceptions. Functions report failure through their <b>return value</b> (<code>NULL</code>, <code>-1</code>, <code>EOF</code>), and many also set the global <code>errno</code> to say why.</p>`,
      code: R`#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>

int main(void) {
    FILE *f = fopen("/definitely/not/here.txt", "r");
    if (!f) {
        int err = errno;                       // save it straight away
        fprintf(stderr, "open failed: %s\n", strerror(err));
        perror("fopen");                       // shortcut form
    }

    errno = 0;
    char *end;
    long v = strtol("123abc", &end, 10);
    if (*end != '\0')
        printf("parsed %ld, junk after: \"%s\"\n", v, end);
    return 0;
}`,
      out: "parsed 123, junk after: \"abc\"\n",
      outNote: "stderr shows: No such file or directory",
      tip: R`A common pro pattern for cleanup: on an error, <code>goto cleanup;</code> jumps to a single label at the end of the function that frees everything in reverse order. You'll see it all over the Linux kernel.`
    },
    {
      title: "stdin, stdout, stderr",
      body: R`<p>Every program starts with three open streams:</p>
<ul>
<li><code>stdin</code> — input, the keyboard by default</li>
<li><code>stdout</code> — normal output, <b>buffered</b></li>
<li><code>stderr</code> — error messages, <b>unbuffered</b>, kept separate so they survive redirection</li>
</ul>`,
      code: R`./prog < input.txt          # stdin from a file
./prog > out.txt            # stdout to a file
./prog 2> errors.log        # stderr to a file
./prog | sort | uniq -c     # pipe stdout into other programs
echo $?                     # exit code of the last command`,
      lang: "sh",
      tip: R`Write errors with <code>fprintf(stderr, ...)</code> and return a non-zero exit code. Your program will then cooperate properly with shell scripts and pipelines.`
    }
  ],
  quiz: [
    { q: "What does fopen return on failure?", opts: ["-1", "NULL", "EOF", "It aborts"], a: 1, why: "Check for NULL and use perror/errno to see why." },
    { q: "What is argv[0]?", opts: ["The first user argument", "The program name/path", "NULL", "The argument count"], a: 1, why: "User arguments start at argv[1]." },
    { q: "Which mode truncates an existing file?", opts: ["\"r\"", "\"a\"", "\"w\"", "\"r+\""], a: 2, why: "\"w\" creates the file or wipes it to zero length." }
  ]
});

COURSE.push({
  title: "Preprocessor & Multi-file Builds",
  level: "Advanced",
  icon: "⚙️",
  cards: [
    {
      title: "#define and macros",
      body: R`<p>The preprocessor performs <b>text substitution</b> before compilation. Macros can take arguments, and you should wrap <b>every</b> parameter and the whole body in parentheses:</p>`,
      code: R`#include <stdio.h>

#define PI 3.14159
#define SQUARE_BAD(x) x * x
#define SQUARE(x) ((x) * (x))
#define ARRAY_LEN(a) (sizeof(a) / sizeof((a)[0]))

int main(void) {
    printf("%d\n", SQUARE_BAD(2 + 3));   // 2 + 3 * 2 + 3 = 11
    printf("%d\n", SQUARE(2 + 3));       // 25
    int v[] = {1, 2, 3, 4, 5, 6, 7};
    printf("%zu %.2f\n", ARRAY_LEN(v), PI);
    return 0;
}`,
      out: "11\n25\n7 3.14\n"
    },
    {
      title: "Macro pitfalls → prefer inline functions",
      body: R`<p>Macros don't know about types or scope, and they evaluate their arguments as often as the argument appears in the body:</p>`,
      code: R`#include <stdio.h>

#define MAX(a, b) ((a) > (b) ? (a) : (b))

static inline int max_int(int a, int b) { return a > b ? a : b; }

int main(void) {
    int i = 5, j = 3;
    int m = MAX(i++, j);   // i++ runs TWICE when i > j
    printf("m=%d i=%d\n", m, i);

    i = 5;
    m = max_int(i++, j);   // function: each argument evaluated once
    printf("m=%d i=%d\n", m, i);
    return 0;
}`,
      out: "m=6 i=7\nm=5 i=6\n",
      tip: R`Use <code>static inline</code> functions for small helpers and <code>enum</code> or <code>const</code> for constants. Keep macros for the things only macros can do: conditional compilation, include guards, <code>__FILE__</code>/<code>__LINE__</code>.`
    },
    {
      title: "Conditional compilation",
      body: R`<p>Include or exclude code at build time. This is how one codebase targets several platforms, or ships with debug logging that compiles away to nothing:</p>`,
      code: R`#include <stdio.h>

#ifdef DEBUG
  #define LOG(...) fprintf(stderr, "[%s:%d] " __VA_ARGS__), \
                   fprintf(stderr, "\n")
#else
  #define LOG(...) ((void)0)
#endif

int main(void) {
#if defined(_WIN32)
    printf("Windows\n");
#elif defined(__linux__)
    printf("Linux\n");
#else
    printf("Something else\n");
#endif
    LOG("x = %d", 42);   // only with: gcc -DDEBUG ...
    return 0;
}`,
      out: "Linux\n",
      outNote: "built on Linux without -DDEBUG",
      cflags: "-Wno-unused-value"
    },
    {
      title: "Splitting code into files",
      body: R`<p>Real projects split code into modules: a <b>header</b> (<code>.h</code>) that declares the interface, and a <b>source</b> file (<code>.c</code>) that implements it. <b>Include guards</b> stop a header from being pasted in twice.</p>`,
      code: R`/* ---- mathx.h ---- */
#ifndef MATHX_H
#define MATHX_H

int gcd(int a, int b);
int lcm(int a, int b);

#endif

/* ---- mathx.c ---- */
#include "mathx.h"
int gcd(int a, int b) { while (b) { int t = b; b = a % b; a = t; } return a; }
int lcm(int a, int b) { return a / gcd(a, b) * b; }

/* ---- main.c ---- */
#include <stdio.h>
#include "mathx.h"          // quotes = search your project first
int main(void) { printf("%d %d\n", gcd(12, 18), lcm(4, 6)); }

/* build:  gcc main.c mathx.c -o app   →  prints: 6 12 */`,
      run: false,
      tip: R`<code>#pragma once</code> is a widely supported one-line alternative to include guards, though it isn't part of the C standard.`
    },
    {
      title: "Linkage: static & extern",
      body: R`
<ul>
<li>A top-level <code>static</code> function or variable is <b>private to its .c file</b> (internal linkage). Use it for helpers that aren't part of your public API.</li>
<li><code>extern int count;</code> <i>declares</i> a variable that is <i>defined</i> in some other file.</li>
</ul>`,
      code: R`/* ---- config.c ---- */
int verbose = 0;                       // definition (one file only)
static int cache_hits = 0;             // invisible outside config.c
static void helper(void) { cache_hits++; }

/* ---- config.h ---- */
extern int verbose;                    // declaration for other files

/* ---- main.c ---- */
#include "config.h"
// verbose is usable here; cache_hits and helper() are not`,
      run: false,
      tip: R`Make everything <code>static</code> by default and only expose what other files genuinely need. That's encapsulation, C-style.`
    },
    {
      title: "Build automation with Make",
      body: R`<p>A <code>Makefile</code> rebuilds only the files that changed. Here's a minimal but realistic one:</p>`,
      code: R`CC      = gcc
CFLAGS  = -std=c17 -Wall -Wextra -O2 -g
OBJS    = main.o mathx.o

app: $(OBJS)
	$(CC) $(CFLAGS) $(OBJS) -o app

%.o: %.c mathx.h
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) app

.PHONY: clean`,
      lang: "make",
      warn: R`Recipe lines in a Makefile must be indented with a <b>TAB</b>, not spaces. For larger projects look at <b>CMake</b> or <b>Meson</b>.`
    },
    {
      title: "assert & predefined macros",
      body: R`<p><code>assert(cond)</code> aborts with the file and line number when a condition that “can't happen” does happen. It's your guard against programmer errors. Building with <code>-DNDEBUG</code> removes every assert.</p>`,
      code: R`#include <stdio.h>
#include <assert.h>

#define STR(x) #x                 // stringify
#define CONCAT(a, b) a##b         // token pasting

double safe_div(double a, double b) {
    assert(b != 0 && "divisor must be non-zero");
    return a / b;
}

int main(void) {
    int CONCAT(my, Var) = 7;      // declares myVar
    printf("%s = %d\n", STR(myVar), myVar);
    printf("%s:%d in %s()\n", __FILE__, __LINE__, __func__);
    printf("%.1f\n", safe_div(9, 2));
    return 0;
}`,
      out: "myVar = 7\nmain.c:15 in main()\n4.5\n",
      outNote: "if the file is saved as main.c",
      warn: R`Asserts are for <b>bugs</b>, not for user input or I/O errors. Those need real error handling, because asserts disappear in release builds.`
    }
  ],
  quiz: [
    { q: "With `#define DOUBLE(x) x + x`, what is `3 * DOUBLE(2)`?", opts: ["12", "8", "6", "10"], a: 1, why: "Expands to 3 * 2 + 2 = 8. Parenthesise macro bodies!" },
    { q: "What does a top-level `static` function mean?", opts: ["It runs once", "It's only visible within its own .c file", "It's allocated statically on the heap", "It can't take arguments"], a: 1, why: "static at file scope gives internal linkage." },
    { q: "What are include guards for?", opts: ["Speed up the linker", "Prevent a header's contents from being included twice", "Protect against buffer overflows", "Hide private functions"], a: 1, why: "#ifndef/#define/#endif ensures single inclusion per translation unit." }
  ]
});

COURSE.push({
  title: "Advanced Pointers",
  level: "Advanced",
  icon: "🎯",
  cards: [
    {
      title: "Function pointers",
      body: R`<p>Functions have addresses too. A function pointer stores one, so you can pass behaviour around as data.</p>
<p>The syntax: <code>int (*op)(int, int)</code> declares op as a pointer to a function that takes two ints and returns an int.</p>`,
      code: R`#include <stdio.h>

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }

int apply(int (*op)(int, int), int x, int y) {
    return op(x, y);
}

int main(void) {
    int (*f)(int, int) = add;
    printf("%d\n", f(2, 3));
    f = mul;
    printf("%d\n", f(2, 3));
    printf("%d\n", apply(add, 10, 20));
    return 0;
}`,
      out: "5\n6\n30\n"
    },
    {
      title: "Callbacks: qsort",
      body: R`<p>The standard library's <code>qsort</code> sorts <b>any</b> array. You hand it a comparison <b>callback</b> that returns a negative number, zero or a positive number.</p>`,
      code: R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct { const char *name; int age; } Person;

int by_age(const void *a, const void *b) {
    const Person *x = a, *y = b;
    return (x->age > y->age) - (x->age < y->age);   // no overflow
}

int by_name(const void *a, const void *b) {
    return strcmp(((const Person *)a)->name, ((const Person *)b)->name);
}

int main(void) {
    Person p[] = {{"Zed", 30}, {"Amy", 25}, {"Bob", 41}};
    size_t n = sizeof p / sizeof p[0];

    qsort(p, n, sizeof p[0], by_age);
    for (size_t i = 0; i < n; i++) printf("%s ", p[i].name);
    printf("\n");

    qsort(p, n, sizeof p[0], by_name);
    for (size_t i = 0; i < n; i++) printf("%s ", p[i].name);
    printf("\n");
    return 0;
}`,
      out: "Amy Zed Bob \nAmy Bob Zed \n",
      warn: R`Don't write <code>return x->age - y->age;</code>. With large values the subtraction can overflow. The <code>(a &gt; b) - (a &lt; b)</code> idiom is always safe.`
    },
    {
      title: "void* and generic code",
      body: R`<p><code>void *</code> is a pointer to “something” of unknown type. You can't dereference it directly. Combine it with a <b>size</b> and <code>memcpy</code> to write functions that work on any type:</p>`,
      code: R`#include <stdio.h>
#include <string.h>

void generic_swap(void *a, void *b, size_t size) {
    unsigned char tmp[64];
    if (size > sizeof tmp) return;     // keep the example simple
    memcpy(tmp, a, size);
    memcpy(a, b, size);
    memcpy(b, tmp, size);
}

int main(void) {
    int x = 1, y = 2;
    double d1 = 1.5, d2 = 9.75;
    generic_swap(&x, &y, sizeof x);
    generic_swap(&d1, &d2, sizeof d1);
    printf("%d %d | %.2f %.2f\n", x, y, d1, d2);
    return 0;
}`,
      out: "2 1 | 9.75 1.50\n",
      tip: R`Generic C code gives up type safety, so the compiler can't catch a mismatched size. C11's <code>_Generic</code> lets you pick type-specific functions at compile time instead.`
    },
    {
      title: "Dispatch tables",
      body: R`<p>An array of function pointers can replace a long <code>switch</code>. Interpreters, state machines and command handlers all use this pattern.</p>`,
      code: R`#include <stdio.h>
#include <string.h>

static void cmd_help(void)  { printf("commands: help, hello, quit\n"); }
static void cmd_hello(void) { printf("Hello there!\n"); }
static void cmd_quit(void)  { printf("Goodbye.\n"); }

typedef struct { const char *name; void (*fn)(void); } Command;

static const Command commands[] = {
    {"help", cmd_help}, {"hello", cmd_hello}, {"quit", cmd_quit},
};

int run(const char *input) {
    for (size_t i = 0; i < sizeof commands / sizeof commands[0]; i++)
        if (strcmp(input, commands[i].name) == 0) {
            commands[i].fn();
            return 0;
        }
    printf("unknown: %s\n", input);
    return -1;
}

int main(void) {
    run("hello"); run("dance"); run("quit");
    return 0;
}`,
      out: "Hello there!\nunknown: dance\nGoodbye.\n"
    },
    {
      title: "Reading complex declarations",
      body: R`<p>Use the <b>right-left rule</b>: start at the name, read right while you can, then read left, and step outward through parentheses.</p>
<table>
<tr><td><code>int *a[10]</code></td><td>array of 10 pointers to int</td></tr>
<tr><td><code>int (*a)[10]</code></td><td>pointer to an array of 10 ints</td></tr>
<tr><td><code>int (*f)(void)</code></td><td>pointer to a function returning int</td></tr>
<tr><td><code>int *f(void)</code></td><td>function returning a pointer to int</td></tr>
<tr><td><code>void (*signal(int, void (*)(int)))(int)</code></td><td>the real <code>signal()</code>: a function taking (int, handler) and returning a handler 🤯</td></tr>
</table>`,
      code: R`// Tame it with typedef:
typedef void (*Handler)(int);
Handler signal(int sig, Handler h);   // same thing, readable`,
      run: false,
      tip: R`The site cdecl.org translates C declarations into English and back.`
    },
    {
      title: "volatile & restrict",
      body: R`
<ul>
<li><code>volatile</code> means the value can change outside the program's control (a hardware register, a signal handler), so the compiler must re-read it every time and can't cache it in a register. It does <b>not</b> make code thread-safe.</li>
<li><code>restrict</code> (C99) is your promise that, for its lifetime, this pointer is the <b>only</b> way to reach that memory. The compiler can then optimise more aggressively. <code>memcpy</code> uses it, which is why overlapping memcpy is UB (use <code>memmove</code> instead).</li>
</ul>`,
      code: R`volatile uint32_t *const STATUS_REG = (uint32_t *)0x40021000;
while ((*STATUS_REG & READY_BIT) == 0) { }   // re-read each loop

void add_arrays(size_t n, float *restrict out,
                const float *restrict a, const float *restrict b) {
    for (size_t i = 0; i < n; i++)
        out[i] = a[i] + b[i];                // freely vectorised
}`,
      run: false
    },
    {
      title: "Variadic functions",
      body: R`<p>Functions like <code>printf</code> take a variable number of arguments. <code>&lt;stdarg.h&gt;</code> lets you write your own:</p>`,
      code: R`#include <stdio.h>
#include <stdarg.h>

int sum(int count, ...) {
    va_list ap;
    va_start(ap, count);
    int total = 0;
    for (int i = 0; i < count; i++)
        total += va_arg(ap, int);
    va_end(ap);
    return total;
}

void log_msg(const char *level, const char *fmt, ...) {
    va_list ap;
    va_start(ap, fmt);
    printf("[%s] ", level);
    vprintf(fmt, ap);          // forward to the v-version
    printf("\n");
    va_end(ap);
}

int main(void) {
    printf("%d\n", sum(4, 10, 20, 30, 40));
    log_msg("INFO", "user %s logged in %d times", "ada", 3);
    return 0;
}`,
      out: "100\n[INFO] user ada logged in 3 times\n",
      tip: R`Add <code>__attribute__((format(printf, 2, 3)))</code> to <code>log_msg</code> and GCC/Clang will type-check its format strings just like printf's.`
    }
  ],
  quiz: [
    { q: "What is `int (*p)[5]`?", opts: ["Array of 5 int pointers", "Pointer to an array of 5 ints", "Function returning int*", "Pointer to function"], a: 1, why: "Parentheses bind * to p first: p is a pointer, to an array[5] of int." },
    { q: "What must a qsort comparator return when a should come before b?", opts: ["A positive value", "Zero", "A negative value", "true"], a: 2, why: "Negative: a before b; zero: equal; positive: a after b." },
    { q: "When is `volatile` the right tool?", opts: ["Sharing data between threads", "Memory-mapped hardware registers", "Making code faster", "Constant data"], a: 1, why: "volatile prevents caching of values that change outside the program; for threads use atomics/mutexes." },
    { q: "Can you dereference a `void *` directly?", opts: ["Yes", "No — cast it to a concrete type first", "Only if it's NULL", "Only in C23"], a: 1, why: "void has no size, so *vp has no meaning until you cast." }
  ]
});

COURSE.push({
  title: "Data Structures in C",
  level: "Advanced",
  icon: "🌳",
  cards: [
    {
      title: "Linked list: the basics",
      body: R`<p>A linked list is a chain of <b>nodes</b>, each allocated separately on the heap and pointing to the next one. Insertion at the front is O(1), but there's no random access.</p>`,
      code: R`#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node *next;
} Node;

Node *push_front(Node *head, int value) {
    Node *n = malloc(sizeof *n);
    if (!n) return head;
    n->value = value;
    n->next = head;
    return n;                       // new head
}

void print_list(const Node *n) {
    for (; n; n = n->next) printf("%d -> ", n->value);
    printf("NULL\n");
}

void free_list(Node *n) {
    while (n) { Node *next = n->next; free(n); n = next; }
}

int main(void) {
    Node *head = NULL;
    for (int i = 1; i <= 4; i++) head = push_front(head, i * 10);
    print_list(head);
    free_list(head);
    return 0;
}`,
      out: "40 -> 30 -> 20 -> 10 -> NULL\n",
      warn: R`In <code>free_list</code>, save <code>next</code> <b>before</b> calling <code>free</code>. Reading <code>n-&gt;next</code> after the free is use-after-free.`
    },
    {
      title: "The pointer-to-pointer trick",
      body: R`<p>Linus Torvalds calls this “good taste”. If you walk the list with a pointer to the link itself (<code>Node **</code>), removing the head is no longer a special case:</p>`,
      code: R`#include <stdio.h>
#include <stdlib.h>

typedef struct Node { int value; struct Node *next; } Node;

void remove_value(Node **link, int value) {
    while (*link) {
        if ((*link)->value == value) {
            Node *dead = *link;
            *link = dead->next;     // works for head AND middle nodes
            free(dead);
            return;
        }
        link = &(*link)->next;
    }
}

void append(Node **link, int value) {
    while (*link) link = &(*link)->next;
    *link = calloc(1, sizeof **link);
    if (*link) (*link)->value = value;
}

int main(void) {
    Node *head = NULL;
    for (int i = 1; i <= 5; i++) append(&head, i);
    remove_value(&head, 1);   // head
    remove_value(&head, 4);   // middle
    for (Node *n = head; n; n = n->next) printf("%d ", n->value);
    printf("\n");
    while (head) { Node *n = head->next; free(head); head = n; }
    return 0;
}`,
      out: "2 3 5 \n"
    },
    {
      title: "Stack (LIFO)",
      body: R`<p>Last in, first out. An array plus a <code>top</code> index is all you need. Uses include undo, expression evaluation, DFS and bracket matching:</p>`,
      code: R`#include <stdio.h>
#include <stdbool.h>
#include <string.h>

#define CAP 64
typedef struct { char items[CAP]; int top; } Stack;

bool push(Stack *s, char c) { if (s->top == CAP) return false; s->items[s->top++] = c; return true; }
bool pop(Stack *s, char *out) { if (s->top == 0) return false; *out = s->items[--s->top]; return true; }

bool balanced(const char *expr) {
    Stack s = {.top = 0};
    for (; *expr; expr++) {
        char c = *expr, open;
        if (strchr("([{", c)) { if (!push(&s, c)) return false; }
        else if (strchr(")]}", c)) {
            if (!pop(&s, &open)) return false;
            if ((c == ')' && open != '(') || (c == ']' && open != '[') ||
                (c == '}' && open != '{')) return false;
        }
    }
    return s.top == 0;
}

int main(void) {
    const char *tests[] = {"{a[b(c)]}", "(]", "((x)"};
    for (int i = 0; i < 3; i++)
        printf("%-10s %s\n", tests[i], balanced(tests[i]) ? "ok" : "bad");
    return 0;
}`,
      out: "{a[b(c)]}  ok\n(]         bad\n((x)       bad\n"
    },
    {
      title: "Queue: ring buffer",
      body: R`<p>First in, first out. A <b>circular buffer</b> reuses a fixed array by wrapping the head and tail indexes around with <code>%</code>. It's everywhere in drivers, audio and networking.</p>`,
      code: R`#include <stdio.h>
#include <stdbool.h>

#define QCAP 4
typedef struct { int buf[QCAP]; size_t head, tail, count; } Queue;

bool enqueue(Queue *q, int v) {
    if (q->count == QCAP) return false;
    q->buf[q->tail] = v;
    q->tail = (q->tail + 1) % QCAP;
    q->count++;
    return true;
}

bool dequeue(Queue *q, int *v) {
    if (q->count == 0) return false;
    *v = q->buf[q->head];
    q->head = (q->head + 1) % QCAP;
    q->count--;
    return true;
}

int main(void) {
    Queue q = {0};
    int v;
    for (int i = 1; i <= 5; i++)
        if (!enqueue(&q, i)) printf("full, dropped %d\n", i);
    dequeue(&q, &v); printf("got %d\n", v);
    enqueue(&q, 6);                     // wraps around
    while (dequeue(&q, &v)) printf("%d ", v);
    printf("\n");
    return 0;
}`,
      out: "full, dropped 5\ngot 1\n2 3 4 6 \n"
    },
    {
      title: "Binary search tree",
      body: R`<p>Each node's left subtree holds smaller keys and its right subtree holds larger keys. Search and insert take O(log n) on a balanced tree, and an <b>in-order</b> traversal visits the keys in sorted order.</p>`,
      code: R`#include <stdio.h>
#include <stdlib.h>

typedef struct Tree { int key; struct Tree *left, *right; } Tree;

Tree *insert(Tree *t, int key) {
    if (!t) {
        t = calloc(1, sizeof *t);
        if (t) t->key = key;
        return t;
    }
    if (key < t->key)      t->left  = insert(t->left, key);
    else if (key > t->key) t->right = insert(t->right, key);
    return t;
}

int contains(const Tree *t, int key) {
    while (t) {
        if (key == t->key) return 1;
        t = key < t->key ? t->left : t->right;
    }
    return 0;
}

void inorder(const Tree *t) {
    if (!t) return;
    inorder(t->left); printf("%d ", t->key); inorder(t->right);
}

void destroy(Tree *t) { if (t) { destroy(t->left); destroy(t->right); free(t); } }

int main(void) {
    int keys[] = {50, 30, 70, 20, 40, 60, 80};
    Tree *root = NULL;
    for (int i = 0; i < 7; i++) root = insert(root, keys[i]);
    inorder(root);
    printf("\nhas 60? %d  has 65? %d\n", contains(root, 60), contains(root, 65));
    destroy(root);
    return 0;
}`,
      out: "20 30 40 50 60 70 80 \nhas 60? 1  has 65? 0\n",
      tip: R`Insert keys that are already sorted and the tree degrades into a linked list with O(n) operations. Self-balancing trees (AVL, red-black) prevent that.`
    },
    {
      title: "Hash table",
      body: R`<p>A hash function maps a key to a bucket index, giving average O(1) lookup. This version handles collisions by <b>chaining</b>: each bucket holds a linked list.</p>`,
      code: R`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define NBUCKETS 64

typedef struct Entry { char *key; int value; struct Entry *next; } Entry;
typedef struct { Entry *buckets[NBUCKETS]; } Map;

static unsigned long hash(const char *s) {      // djb2 by Dan Bernstein
    unsigned long h = 5381;
    for (; *s; s++) h = h * 33 + (unsigned char)*s;
    return h;
}

int map_put(Map *m, const char *key, int value) {
    Entry **slot = &m->buckets[hash(key) % NBUCKETS];
    for (Entry *e = *slot; e; e = e->next)
        if (strcmp(e->key, key) == 0) { e->value = value; return 0; }
    Entry *e = malloc(sizeof *e);
    if (!e) return -1;
    e->key = malloc(strlen(key) + 1);
    if (!e->key) { free(e); return -1; }
    strcpy(e->key, key);
    e->value = value;
    e->next = *slot;
    *slot = e;
    return 0;
}

int *map_get(Map *m, const char *key) {
    for (Entry *e = m->buckets[hash(key) % NBUCKETS]; e; e = e->next)
        if (strcmp(e->key, key) == 0) return &e->value;
    return NULL;
}

void map_free(Map *m) {
    for (int i = 0; i < NBUCKETS; i++)
        for (Entry *e = m->buckets[i], *n; e; e = n) {
            n = e->next; free(e->key); free(e);
        }
}

int main(void) {
    Map m = {0};
    const char *words[] = {"the", "cat", "sat", "on", "the", "mat", "the"};
    for (int i = 0; i < 7; i++) {
        int *count = map_get(&m, words[i]);
        if (count) (*count)++; else map_put(&m, words[i], 1);
    }
    printf("the=%d cat=%d dog=%s\n",
           *map_get(&m, "the"), *map_get(&m, "cat"),
           map_get(&m, "dog") ? "yes" : "missing");
    map_free(&m);
    return 0;
}`,
      out: "the=3 cat=1 dog=missing\n",
      tip: R`Production hash tables resize (rehash) once the load factor passes about 0.75, and they often use open addressing for better cache behaviour.`
    }
  ],
  quiz: [
    { q: "Time to insert at the head of a singly linked list?", opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"], a: 0, why: "You just allocate a node and point it at the old head." },
    { q: "An in-order traversal of a BST yields…", opts: ["Random order", "Keys in sorted order", "Reverse insertion order", "Level by level"], a: 1, why: "Left subtree, node, right subtree visits keys ascending." },
    { q: "Why use `Node **` when deleting from a list?", opts: ["It's faster", "It removes the special case for deleting the head", "It avoids malloc", "Required by the standard"], a: 1, why: "Pointing at the link itself lets you rewrite head or ->next uniformly." }
  ]
});

COURSE.push({
  title: "Pro Level C",
  level: "Pro",
  icon: "🏆",
  cards: [
    {
      title: "Undefined behavior: the dragon",
      body: R`<p><b>Undefined behavior (UB)</b> means the C standard places <i>no requirements at all</i> on what happens. Optimising compilers <b>assume UB never occurs</b> and transform code on that assumption, sometimes deleting your safety checks.</p>
<p>The usual suspects:</p>
<ul>
<li>signed integer overflow</li>
<li>out-of-bounds access, use-after-free, NULL dereference</li>
<li>reading an uninitialised variable</li>
<li>modifying a variable twice without sequencing (<code>i = i++</code>)</li>
<li>violating strict aliasing (reading a <code>float</code> through an <code>int *</code>)</li>
<li>shifting by at least the type's width</li>
</ul>`,
      code: R`int check(int x) {
    // The programmer wants an overflow check, but signed overflow is UB,
    // so the compiler may treat x + 1 > x as always true and
    // reduce this whole function to: return 1;
    return x + 1 > x;
}`,
      run: false,
      warn: R`“It works on my machine” means nothing when UB is involved. It can break with a new compiler version, a different optimisation level or a different CPU.`
    },
    {
      title: "Let the compiler be your reviewer",
      body: R`<p>A pro's standard build flags:</p>`,
      code: R`# development build
gcc -std=c17 -g -O0 \
    -Wall -Wextra -Wpedantic -Wshadow -Wconversion \
    -Wformat=2 -Wnull-dereference -Wdouble-promotion \
    -fsanitize=address,undefined -fno-omit-frame-pointer \
    main.c -o app

# release build
gcc -std=c17 -O2 -DNDEBUG -Wall -Wextra \
    -D_FORTIFY_SOURCE=2 -fstack-protector-strong main.c -o app

# static analysis
gcc -fanalyzer main.c            # GCC 10+
clang --analyze main.c
cppcheck --enable=all .`,
      lang: "sh",
      tip: R`Add <code>-Werror</code> in CI so warnings can't pile up. Run <code>clang-format</code> to end style debates and <code>clang-tidy</code> for deeper lint checks.`
    },
    {
      title: "Debugging with gdb",
      body: R`<p>Stop sprinkling <code>printf</code>s around. Compile with <code>-g</code> and step through the code:</p>`,
      code: R`gcc -g -O0 prog.c -o prog
gdb ./prog

(gdb) break main          # or: break file.c:42
(gdb) run arg1 arg2
(gdb) next                # step over a line
(gdb) step                # step into a function
(gdb) print x             # inspect a variable;  print *ptr, print arr[3]
(gdb) display i           # print i after every step
(gdb) backtrace           # where did we crash? (bt)
(gdb) frame 2             # jump to a caller's frame
(gdb) watch total         # stop whenever 'total' changes
(gdb) continue
(gdb) quit`,
      lang: "sh",
      tip: R`When a program segfaults, run it under gdb and type <code>bt</code>. You'll get the exact line and the call chain that led to it. On macOS use <code>lldb</code>; its commands are very similar.`
    },
    {
      title: "Bit manipulation toolkit",
      body: R`<p>Idioms every systems programmer knows by heart:</p>`,
      code: R`#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>

#define BIT(n)            (1u << (n))
#define SET(x, n)         ((x) |=  BIT(n))
#define CLEAR(x, n)       ((x) &= ~BIT(n))
#define TOGGLE(x, n)      ((x) ^=  BIT(n))
#define IS_SET(x, n)      (((x) >> (n)) & 1u)

bool is_pow2(uint32_t x)   { return x && !(x & (x - 1)); }
uint32_t lowest_bit(uint32_t x) { return x & -x; }

int popcount(uint32_t x) {           // Kernighan's trick
    int c = 0;
    while (x) { x &= x - 1; c++; }   // clears the lowest set bit
    return c;
}

int main(void) {
    uint32_t flags = 0;
    SET(flags, 3); SET(flags, 0); TOGGLE(flags, 5); CLEAR(flags, 0);
    printf("flags=0x%02X bit3=%u\n", flags, IS_SET(flags, 3));
    printf("%d %d %d\n", is_pow2(64), is_pow2(96), popcount(0xF0F0));
    printf("lowest bit of 40 = %u\n", lowest_bit(40));
    printf("%d\n", __builtin_popcount(0xF0F0));   // GCC/Clang: one CPU instruction
    return 0;
}`,
      out: "flags=0x28 bit3=1\n1 0 8\nlowest bit of 40 = 8\n8\n"
    },
    {
      title: "Performance: think in cache lines",
      body: R`<p>On modern hardware, <b>memory access</b> costs far more than arithmetic. Reading from main memory is roughly 100× slower than reading from the L1 cache. In practice that means:</p>
<ul>
<li>Walk memory <b>sequentially</b>: arrays beat linked lists</li>
<li>Keep the data you use together close together (struct of arrays vs array of structs)</li>
<li>Avoid needless allocation inside hot loops</li>
<li><b>Measure first</b>: <code>perf stat</code>, <code>perf record</code>, <code>gprof</code>, or simply <code>clock_gettime</code></li>
</ul>`,
      code: R`#define _POSIX_C_SOURCE 199309L   // expose clock_gettime with -std=c17
#include <stdio.h>
#include <time.h>

#define N 4096
static int grid[N][N];                    // 64 MB, far bigger than any cache

static double now(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts.tv_sec + ts.tv_nsec / 1e9;
}

int main(void) {
    for (int r = 0; r < N; r++)            // fill it (and touch every page)
        for (int c = 0; c < N; c++) grid[r][c] = r ^ c;

    long sum = 0;
    double t = now();
    for (int r = 0; r < N; r++)          // row-major: cache friendly
        for (int c = 0; c < N; c++) sum += grid[r][c];
    double fast = now() - t;

    t = now();
    for (int c = 0; c < N; c++)          // column-major: cache hostile
        for (int r = 0; r < N; r++) sum += grid[r][c];
    double slow = now() - t;

    printf("row-major %.3fs, column-major %.3fs (sum=%ld)\n", fast, slow, sum);
    return 0;
}`,
      out: "row-major 0.008s, column-major 0.124s (sum=68702699520)\n",
      outNote: "sample run with -O2; your timings will differ, but expect column-major to be many times slower",
      noCheck: true,
      tip: R`“Premature optimisation is the root of all evil” (Knuth). Write clear code first, profile it, and then optimise the hot 3%.`
    },
    {
      title: "Writing secure C",
      body: R`<p>Most CVEs in C code come from a handful of patterns. Guard against them:</p>
<ul>
<li><b>Bound every write:</b> <code>snprintf</code>, <code>fgets</code>, <code>%63s</code>, explicit lengths</li>
<li><b>Check sizes before arithmetic:</b> <code>n * size</code> can overflow before you call malloc</li>
<li><b>Never</b> use user input as a format string</li>
<li>Check <b>every</b> return value: malloc, fopen, read, write</li>
<li>Clear secrets with <code>memset_explicit</code> (C23) or <code>explicit_bzero</code>, because a plain memset can be optimised away</li>
</ul>`,
      code: R`#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

void *alloc_array(size_t count, size_t size) {
    if (size != 0 && count > SIZE_MAX / size)   // would overflow
        return NULL;
    return malloc(count * size);
}

int main(void) {
    const char *user_input = "%s%s%n";          // attacker-controlled
    // printf(user_input);        // FORMAT STRING VULNERABILITY
    printf("%s\n", user_input);   // correct: input is data, not format

    void *p = alloc_array(SIZE_MAX / 2, 4);
    printf("huge alloc %s\n", p ? "succeeded?!" : "safely refused");
    free(p);
    return 0;
}`,
      out: "%s%s%n\nhuge alloc safely refused\n"
    },
    {
      title: "Portability: endianness & friends",
      body: R`<p><b>Endianness</b> is the order of bytes within a multi-byte number. x86 and ARM (usually) are <b>little-endian</b>: the least significant byte comes first. Network protocols use <b>big-endian</b>.</p>`,
      code: R`#include <stdio.h>
#include <stdint.h>

static void put_u32_be(uint8_t *buf, uint32_t v) {   // portable encode
    buf[0] = v >> 24; buf[1] = v >> 16; buf[2] = v >> 8; buf[3] = v;
}

static uint32_t get_u32_be(const uint8_t *b) {       // portable decode
    return (uint32_t)b[0] << 24 | (uint32_t)b[1] << 16 |
           (uint32_t)b[2] << 8  | b[3];
}

int main(void) {
    uint32_t x = 0x11223344;
    uint8_t *bytes = (uint8_t *)&x;      // char-type access: allowed
    printf("in memory: %02x %02x %02x %02x\n",
           bytes[0], bytes[1], bytes[2], bytes[3]);

    uint8_t wire[4];
    put_u32_be(wire, x);
    printf("on wire:   %02x %02x %02x %02x -> 0x%08X\n",
           wire[0], wire[1], wire[2], wire[3], get_u32_be(wire));
    return 0;
}`,
      out: "in memory: 44 33 22 11\non wire:   11 22 33 44 -> 0x11223344\n",
      outNote: "on a little-endian machine",
      tip: R`Shift-based encoding like <code>put_u32_be</code> works on <b>every</b> CPU regardless of its endianness. Prefer it to casting buffers to struct pointers.`
    },
    {
      title: "Concurrency with threads",
      body: R`<p>C11 added <code>&lt;threads.h&gt;</code> and <code>&lt;stdatomic.h&gt;</code>. In practice POSIX <b>pthreads</b> is the most widely used API. Shared data needs a <b>mutex</b> or an <b>atomic</b>; without one you have a data race, which is UB.</p>`,
      code: R`#include <stdio.h>
#include <pthread.h>
#include <stdatomic.h>

#define THREADS 4
#define ITERS   100000

static long plain = 0;                  // racy
static atomic_long safe = 0;            // atomic
static long locked = 0;
static pthread_mutex_t lock = PTHREAD_MUTEX_INITIALIZER;

static void *worker(void *arg) {
    (void)arg;
    for (int i = 0; i < ITERS; i++) {
        plain++;                          // DATA RACE: lost updates
        atomic_fetch_add(&safe, 1);
        pthread_mutex_lock(&lock);
        locked++;
        pthread_mutex_unlock(&lock);
    }
    return NULL;
}

int main(void) {
    pthread_t t[THREADS];
    for (int i = 0; i < THREADS; i++) pthread_create(&t[i], NULL, worker, NULL);
    for (int i = 0; i < THREADS; i++) pthread_join(t[i], NULL);
    printf("plain=%ld atomic=%ld mutex=%ld (expected %d)\n",
           plain, (long)safe, locked, THREADS * ITERS);
    return 0;
}`,
      cflags: "-pthread",
      out: "plain=381858 atomic=400000 mutex=400000 (expected 400000)\n",
      outNote: "sample run, compiled with -pthread; the plain count changes every run",
      noCheck: true,
      warn: R`Run threaded code with <code>-fsanitize=thread</code> (ThreadSanitizer) to detect data races automatically.`
    },
    {
      title: "The C standards timeline",
      body: R`
<table>
<tr><td><b>K&amp;R C</b> 1978</td><td>the original book <i>The C Programming Language</i></td></tr>
<tr><td><b>C89/C90</b></td><td>first ANSI/ISO standard: prototypes, <code>void</code>, <code>const</code></td></tr>
<tr><td><b>C99</b></td><td><code>//</code> comments, <code>stdint.h</code>, <code>bool</code>, VLAs, designated initialisers, <code>inline</code>, <code>restrict</code></td></tr>
<tr><td><b>C11</b></td><td>threads, atomics, <code>_Generic</code>, <code>_Static_assert</code>, anonymous structs; <code>gets</code> removed</td></tr>
<tr><td><b>C17</b></td><td>bug-fix release, the safe default today</td></tr>
<tr><td><b>C23</b></td><td><code>bool/true/false</code> as keywords, <code>nullptr</code>, <code>constexpr</code>, <code>typeof</code>, <code>#embed</code>, <code>[[nodiscard]]</code> attributes, binary literals <code>0b1010</code>, <code>auto</code> type inference</td></tr>
</table>`,
      code: R`#include <stdio.h>
#include <assert.h>

#define type_name(x) _Generic((x), \
    int: "int", double: "double", char *: "char *", default: "other")

static_assert(sizeof(int) >= 4, "need 32-bit int");   // compile-time check

int main(void) {
    char *s = "hi";
    printf("%s %s %s\n", type_name(42), type_name(3.14), type_name(s));
    return 0;
}`,
      out: "int double char *\n",
      tip: R`Choose a standard explicitly with <code>-std=c17</code> or <code>-std=c23</code> (GCC 14+ / Clang 18+ support most of C23).`
    },
    {
      title: "Your road from here to pro",
      body: R`<p>Reading takes you only part of the way. To become a pro, <b>build things</b>. Projects in rising order of difficulty:</p>
<ol>
<li>A CLI tool: <code>wc</code>, <code>grep</code> or <code>hexdump</code> clone</li>
<li>A text-adventure game or a to-do app that saves to a file</li>
<li>Your own <code>malloc</code>/<code>free</code> built on a big static buffer</li>
<li>A Unix shell with <code>fork</code>/<code>exec</code>/pipes</li>
<li>An HTTP server with sockets</li>
<li>An interpreter for a small language (see <i>Crafting Interpreters</i>)</li>
<li>Code for a microcontroller (Arduino, STM32, Raspberry Pi Pico)</li>
</ol>
<p><b>Books:</b> <i>The C Programming Language</i> (K&amp;R) · <i>Modern C</i> by Jens Gustedt (free PDF) · <i>Effective C</i> by Robert Seacord · <i>Expert C Programming</i> by Peter van der Linden.</p>
<p><b>Read great code:</b> SQLite, Redis, Lua, the Linux kernel, curl.</p>`,
      tip: R`🎉 You've reached the end of the deck. Take the final quiz, then go back to any module whose quiz you scored low on. Repetition makes it stick.`
    }
  ],
  quiz: [
    { q: "What may a compiler do when your code has undefined behavior?", opts: ["Only crash", "Only print a warning", "Anything — including removing code", "Insert a runtime check"], a: 2, why: "The standard imposes no requirements; optimisers exploit that." },
    { q: "What does `x & (x - 1)` do?", opts: ["Doubles x", "Clears the lowest set bit", "Sets the highest bit", "Negates x"], a: 1, why: "It's why `x && !(x & (x-1))` tests for a power of two." },
    { q: "Why is `printf(user_input)` dangerous?", opts: ["It's slow", "The input is interpreted as a format string — attackers can read/write memory", "It doesn't print newlines", "It's not dangerous"], a: 1, why: "Always use printf(\"%s\", user_input)." },
    { q: "Which tool finds data races automatically?", opts: ["-fsanitize=thread", "valgrind --leak-check", "-O3", "gdb watch"], a: 0, why: "ThreadSanitizer instruments memory accesses to detect races." },
    { q: "Which memory access pattern is fastest for `int a[N][N]`?", opts: ["a[c][r] with c inner", "a[r][c] with c (last index) inner", "Random", "All equal"], a: 1, why: "Row-major layout means the last index is contiguous in memory." }
  ]
});
})();
