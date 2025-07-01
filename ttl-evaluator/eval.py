import tkinter as tk
from tkinter import messagebox
from rdflib.plugins.parsers.notation3 import TurtleParser
from rdflib import Graph, URIRef, Literal, Namespace, RDF
from collections import defaultdict
from io import StringIO

# Read TTL from file 'input.ttl'
with open("input.ttl", "r", encoding="utf-8") as f:
    TTL = f.read()

# Namespaces
MODEL = Namespace("http://activate.htwk-leipzig.de/model#")
OWL = Namespace("http://www.w3.org/2002/07/owl#")
RDF = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
RDFS = Namespace("http://www.w3.org/2000/01/rdf-schema#")

TTL_PREFIXES = {
    "": MODEL,
    "owl": OWL,
    "rdf": RDF,
    "rdfs": RDFS,
}

# Parse TTL
ordered_triples = []

class CollectingGraph(Graph):
    def add(self, triple):
        ordered_triples.append(triple)
        super().add(triple)

g = CollectingGraph()
g.parse(data=TTL, format="turtle")

# Helper: get language variants for a subject/predicate
def is_desired_language_or_no_literal(triple):
    _, _, obj = triple
    if isinstance(obj, Literal) and obj.language:
        if obj.language == "de":
            return True
        else:
            return False
    return True

# Filter triples: only @de if 3 language variants
triples = []
for triple in ordered_triples:
    if is_desired_language_or_no_literal(triple):
        triples.append(triple)

# Precompute types for each subject
subject_types = defaultdict(set)
for s, p, o in g.triples((None, RDF.type, None)):
    subject_types[s].add(o)

# Find all subjects that are owl:NamedIndividual AND also :Subject, :Object, :Rule, :Instrument, :Community, :DivisionOfLabour
entity_types = {
    MODEL.Subject, MODEL.Object, MODEL.Rule, MODEL.Instrument, MODEL.Community, MODEL.DivisionOfLabour
}
entity_subjects = set()
for subj, types in subject_types.items():
    if OWL.NamedIndividual in types and types.intersection(entity_types):
        entity_subjects.add(subj)

# Find all subjects that are rdf:type :Conflict or :Comment
conflict_comment_types = {MODEL.Conflict, MODEL.Comment}
conflict_comment_subjects = set()
for subj, types in subject_types.items():
    if types.intersection(conflict_comment_types):
        conflict_comment_subjects.add(subj)

# Now, partition triples
entity_triples = []
other_triples = []

# Now, partition triples
entity_triples = []
other_triples = []

for triple in triples:
    subj = triple[0]
    if subj in entity_subjects and triple[1] == RDF.type and triple[2] in entity_types:
        entity_triples.append(triple)
    elif subj not in entity_subjects and subj not in conflict_comment_subjects:
        other_triples.append(triple)

def short_uri(uri):
    for prefix, ns in TTL_PREFIXES.items():
        ns_str = str(ns)
        if str(uri).startswith(ns_str):
            local = str(uri)[len(ns_str):]
            return f"{prefix}:{local}" if prefix else local
    return str(uri)

# Categories for counting
categories = {
    "entities": {"total": 0, "pos": 0, "neg": 0},
    "conflict_comment": {"total": 0, "pos": 0, "neg": 0},
    "other": {"total": 0, "pos": 0, "neg": 0},
}
total_evaluated = 0

# Tkinter UI
root = tk.Tk()
root.title("RDF Tripel Evaluierung")
root.geometry("1200x400")
root.lift()
root.attributes('-topmost', True)
root.after(100, lambda: root.attributes('-topmost', False))

# Tastatur-Shortcuts
root.bind('p', lambda event: evaluate("pos"))
root.bind('n', lambda event: evaluate("neg"))
root.bind('<space>', lambda event: evaluate("skip"))

undo_stack = []

# Combine triples in desired order
# all_triples = (
#     [("entities", t) for t in entity_triples] +
#     [("other", t) for t in other_triples]
# )

all_triples = [("entities", t) for t in entity_triples]

current = {"idx": 0}

category_label = tk.Label(
    root,
    text="",
    font=("Arial", 28, "bold"),
    justify="center",
    anchor="center"
)
category_label.pack(pady=(20, 5), fill="x", expand=False)

triple_label = tk.Label(
    root,
    text="",
    font=("Arial", 22),
    justify="center",
    anchor="center",
    wraplength=800
)
triple_label.pack(pady=(0, 20), fill="x", expand=True)

def update_wraplength(event):
    triple_label.config(wraplength=event.width - 40)

root.bind('<Configure>', update_wraplength)

def show_triple():
    if current["idx"] >= len(all_triples):
        # Write results
        with open("eval.txt", "w", encoding="utf-8") as f:
            f.write(f"Anzahl evaluierte Tripel: {total_evaluated}\n")
            for cat, vals in categories.items():
                f.write(f"{cat} - total: {vals['total']}, positiv: {vals['pos']}, negativ: {vals['neg']}\n")
        messagebox.showinfo("Fertig", "Alle Tripel wurden evaluiert. Ergebnisse in eval.txt gespeichert.")
        root.destroy()
        return

    cat, triple = all_triples[current["idx"]]
    subj, pred, obj = triple
    subj_str = short_uri(subj)
    pred_str = short_uri(pred)
    obj_str = str(obj) if isinstance(obj, Literal) else short_uri(obj)

    category_label.config(text=f"{cat.capitalize()}")
    triple_label.config(text=f"{subj_str}  –  {pred_str}  –  {obj_str}")

def evaluate(result):
    global total_evaluated
    if current["idx"] >= len(all_triples):
        return
    cat, triple = all_triples[current["idx"]]
    # Für Undo merken, was gemacht wurde
    undo_stack.append((current["idx"], result))
    if result != "skip":
        categories[cat]["total"] += 1
        total_evaluated += 1
        if result == "pos":
            categories[cat]["pos"] += 1
        elif result == "neg":
            categories[cat]["neg"] += 1
    current["idx"] += 1
    show_triple()

def undo():
    global total_evaluated
    if not undo_stack:
        return
    last_idx, last_result = undo_stack.pop()
    if last_idx == 0:
        return
    current["idx"] = last_idx
    cat, triple = all_triples[last_idx]
    if last_result != "skip":
        categories[cat]["total"] -= 1
        total_evaluated -= 1
        if last_result == "pos":
            categories[cat]["pos"] -= 1
        elif last_result == "neg":
            categories[cat]["neg"] -= 1
    show_triple()

label = tk.Label(
    root,
    text="",
    font=("Arial", 12),
    justify="left",
    anchor="w",
    wraplength=800
)
label.pack(pady=20, fill="x", expand=True)

btn_frame = tk.Frame(root)
btn_frame.pack(side="bottom", fill="x", padx=20, pady=10)

btn_pos = tk.Button(btn_frame, text="Positiv", command=lambda: evaluate("pos"))
btn_pos.pack(side="left", fill="x", expand=True, padx=10)

btn_neg = tk.Button(btn_frame, text="Negativ", command=lambda: evaluate("neg"))
btn_neg.pack(side="left", fill="x", expand=True, padx=10)

btn_skip = tk.Button(btn_frame, text="Überspringen", command=lambda: evaluate("skip"))
btn_skip.pack(side="left", fill="x", expand=True, padx=10)

btn_undo = tk.Button(btn_frame, text="Undo", command=undo)
btn_undo.pack(side="left", fill="x", expand=True, padx=10)

# Tastatur-Shortcut für Undo
root.bind('u', lambda event: undo())

show_triple()
root.mainloop()
