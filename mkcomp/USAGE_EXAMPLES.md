# Usage Examples

## Basic Component Generation

### Simple component (auto-detects TypeScript/JavaScript)
mkcomp Button

### Component with props
mkcomp Card -p "title:string,children"

### Component with optional props
mkcomp Modal -p "isOpen:boolean,title:string,onClose?:()=>void"

### Complex props with types
mkcomp UserProfile -p "user:{id:string;name:string;email:string},onEdit:(id:string)=>void"

## Different File Types

### Force TypeScript
mkcomp Button --tsx

### Force JavaScript
mkcomp Button --jsx

## Style Options

### CSS styling
mkcomp Button -s css

### SCSS styling
mkcomp Card -s scss

### Tailwind (no style file generated)
mkcomp Badge -s tailwind

### No styling
mkcomp PlainComponent -s none

## Emmet Structure

### Simple structure
mkcomp Card -e "div.card>h2.title+p.description"

### Complex structure
mkcomp ProductCard -e "article.product>img.image+div.content>h3.title+p.price+button.btn"

### Form component
mkcomp FormInput -e "div.form-group>label.label+input.input[type=text]+span.error"

### Navigation component
mkcomp NavBar -e "nav.navbar>div.brand+ul.nav-links>li*3>a"

## Directory Control

### Custom output directory
mkcomp Button -d src/components/ui

### Nested directory (will be created)
mkcomp FormInput -d src/components/forms/inputs

## Preview Mode (No Files Created)

### Preview what will be generated
mkcomp Button --test

### Preview complex component
mkcomp Modal -p "isOpen:boolean,title:string,onClose:()=>void" -s scss -e "div.modal-overlay>div.modal>div.header+div.body" --test

## Combined Examples

### Full-featured component
mkcomp ConfirmDialog \
-p "title:string,message:string,onConfirm:()=>void,onCancel:()=>void" \
-s scss \
-e "div.modal>div.header>h2.title^div.body>p.message^div.footer>button.cancel+button.confirm" \
--tsx

### E-commerce product card
mkcomp ProductCard \
-p "product:{id:string;name:string;price:number;image:string},onAddToCart:(id:string)=>void" \
-s tailwind \
-e "div.bg-white.rounded-lg.shadow>img.w-full.h-48.object-cover+div.p-4>h3.text-lg.font-bold+p.text-green-600+button.bg-blue-500.text-white.px-4.py
-2.rounded"

## YAML-Based Batch Generation

### Create a template file
mkcomp --template

### Create custom template
mkcomp --template my-components.yaml

### Preview YAML generation
mkcomp --from-yaml components.yaml --test

### Generate all components from YAML
mkcomp --from-yaml components.yaml

### Generate specific components only
mkcomp --from-yaml components.yaml --only Button,Modal

### Override output directory for YAML
mkcomp --from-yaml components.yaml -d custom/output

## Help and Info

### Show help
mkcomp --help

### Show help (short form)
mkcomp -h

Real-World Examples

### Dashboard components
mkcomp DashboardCard -p "title:string,value:number,trend:'up'|'down'|'stable'" -s scss -e
"div.card>div.header>h3.title^div.body>span.value+span.trend"

### Login form
mkcomp LoginForm -p "onSubmit:(email:string,password:string)=>void" -s css -e
"form.login-form>div.field>label+input[type=email]^div.field>label+input[type=password]^button[type=submit]"

### Navigation menu
mkcomp NavMenu -p "items:{label:string;href:string}[],activeItem?:string" -s tailwind -e
"nav.bg-gray-800>ul.flex.space-x-4>li*3>a.text-white.px-3.py-2.rounded"

### Data table component  
mkcomp DataTable -p "data:any[],columns:{key:string;label:string}[],onSort?:(key:string)=>void" -e
"div.table-container>table.table>thead>tr>th*3^tbody>tr*5>td*3"