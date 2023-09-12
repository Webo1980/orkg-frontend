module.exports = function (file, { jscodeshift: j }, options) {
    const source = j(file.source);

    const root = source;

    // exclude files
    if (file.path.endsWith('NextJsMigration/Link.js')) {
        return root.toSource();
    }

    /*
    #########################################################################################
    Replace
        import { useNavigate, useLocation, Link } from 'react-router-dom';
    with
        import Link from 'components/NextJsMigration/Link';
        import { useNavigate, useLocation } from 'react-router-dom';
    */
    // Find the import declarations matching 'react-router-dom'
    const reactRouterImports = root.find(j.ImportDeclaration, {
        source: {
            value: 'react-router-dom',
        },
    });

    // Find if there is an import specifier for 'Link' in the 'react-router-dom' import
    const linkSpecifier = reactRouterImports.find(j.ImportSpecifier, {
        imported: {
            name: 'Link',
        },
    });

    // If 'Link' specifier exists, remove it and add the new import declaration for 'components/NextJsMigration/Link'
    if (linkSpecifier.length > 0) {
        // Remove the 'Link' specifier from 'react-router-dom' import
        linkSpecifier.remove();

        // Add the new import declaration for 'components/NextJsMigration/Link'
        const newImportDeclaration = j.importDeclaration(
            [j.importDefaultSpecifier(j.identifier('Link'))],
            j.stringLiteral('components/NextJsMigration/Link'),
        );
        root.find(j.ImportDeclaration).at(0).insertBefore(newImportDeclaration);
    }

    /*
    #########################################################################################
    Replace
        import { useNavigate, useLocation, NavLink } from 'react-router-dom';
    with
        import Link from 'next/link';
        import { useNavigate, useLocation } from 'react-router-dom';
    */
    // Find the import declarations matching 'react-router-dom'
    const reactRouterImportsNavLink = root.find(j.ImportDeclaration, {
        source: {
            value: 'react-router-dom',
        },
    });

    // Find if there is an import specifier for 'NavLink' in the 'react-router-dom' import
    const linkSpecifierNavLink = reactRouterImportsNavLink.find(j.ImportSpecifier, {
        imported: {
            name: 'NavLink',
        },
    });

    const isNotImportedNextJsMigration =
        root.find(j.ImportDeclaration, {
            source: {
                value: 'components/NextJsMigration/Link',
            },
        }).length > 0;

    // If 'Link' specifier exists, remove it and add the new import declaration for 'next/link'
    if (linkSpecifierNavLink.length > 0 && !isNotImportedNextJsMigration) {
        // Remove the 'Link' specifier from 'react-router-dom' import
        linkSpecifierNavLink.remove();

        // Add the new import declaration for 'next/link'
        const newImportDeclaration = j.importDeclaration(
            [j.importDefaultSpecifier(j.identifier('Link'))],
            j.stringLiteral('components/NextJsMigration/Link'),
        );
        root.find(j.ImportDeclaration).at(0).insertBefore(newImportDeclaration);
    }

    /*
    #########################################################################################
    Replace
         <DropdownItem tag={NavLink} end ...>
    with
         <DropdownItem tag={Link} end ...>
    */
    // Find JSX elements with 'tag={NavLink}'
    root.find(j.JSXElement).forEach(jsxElement => {
        const tagAttribute = jsxElement.node.openingElement.attributes.find(
            attribute =>
                attribute.name &&
                attribute.name.name === 'tag' &&
                attribute.value &&
                attribute.value.expression &&
                attribute.value.expression.name === 'NavLink',
        );

        if (tagAttribute) {
            // Replace 'tag' attribute value with 'Link'
            tagAttribute.value.expression.name = 'Link';
        }
    });

    /*
    #########################################################################################
    Replace
        <Link to={location}></Link>
    with
        <Link href={location}></Link>
    */
    if (!file.path.endsWith('routes.config.js')) {
        source
            // .find(j.JSXElement)
            // .filter(path => path.value.openingElement.name.name === 'Link') // Find all button jsx elements
            .find(j.JSXAttribute) // Find all attributes (props) on the button
            .filter(attribute => attribute.node.name.name === 'to') // Filter to only props called data-foo
            .forEach(attribute => j(attribute).replaceWith(j.jsxAttribute(j.jsxIdentifier('href'), attribute.node.value))); // Reconstruct the attribute, replacing the name and keeping the value
    }
    /*
    ################################
    replace
        <Link href={reverse(PLACEHOLDER_URL, { key: value })}>PLACEHOLDER</Link>
    with
        <Link href={{pathname: PLACEHOLDER_URL, query: { key: value}}}>PLACEHOLDER</Link>
    */

    // const oldCodeOccurrences = source.findJSXElements('Link', {
    //     openingElement: {
    //         name: {
    //             name: 'Link',
    //         },
    //         attributes: [
    //             {
    //                 name: {
    //                     name: 'href',
    //                 },
    //                 value: {
    //                     type: 'Literal', // Check for a string literal value
    //                     value: value => typeof value === 'string',
    //                 },
    //             },
    //         ],
    //     },
    // });

    // oldCodeOccurrences.forEach(path => {
    //     const hrefAttribute = path.node.openingElement.attributes.find(attr => attr?.name?.name === 'href');
    //     console.log('hrefAttribute.value', hrefAttribute.value.expression);
    //     if (hrefAttribute && hrefAttribute.value.type === 'JSXExpressionContainer' && hrefAttribute.value.expression.type === 'MemberExpression') {
    //         hrefAttribute.value = j.jsxExpressionContainer(
    //             j.objectExpression([j.property('init', j.identifier('pathname'), hrefAttribute.value.expression, false, j.identifier('pathname'))]),
    //         );
    //     }
    // });

    // const values = source.filter(j.JSXElement, {
    //     openingElement: {
    //         name: {
    //             name: 'Link',
    //         },
    //     },
    //     children: [
    //         {
    //             type: 'JSXExpressionContainer',
    //             expression: {
    //                 callee: {
    //                     object: {
    //                         name: 'reverse',
    //                     },
    //                 },
    //             },
    //         },
    //     ],
    // });

    // root.findJSXElements('Link').replaceWith(nodePath => {
    //     const { node } = nodePath;

    //     // Check if the Link element has a href attribute
    //     const hrefAttribute = node.openingElement.attributes.find(attribute => attribute.name.name === 'href');

    //     if (!hrefAttribute) {
    //         return node; // No href attribute, do nothing
    //     }

    //     // Extract the existing href value
    //     const hrefValue = hrefAttribute.value.expression;

    //     // Create the new JSX structure
    //     const newJSX = j.jsxElement(
    //         j.jsxOpeningElement(j.jsxIdentifier('Link'), [
    //             j.jsxAttribute(
    //                 j.jsxIdentifier('href'),
    //                 j.jsxExpressionContainer(
    //                     j.objectExpression([
    //                         j.objectProperty(j.identifier('pathname'), hrefValue),
    //                         j.objectProperty(j.identifier('query'), j.objectExpression([])),
    //                     ]),
    //                 ),
    //             ),
    //         ]),
    //         node.closingElement,
    //         node.children,
    //     );

    //     return newJSX;
    // });

    /** !!!!!!!!!!!!!!!!!!!!NEW!!!!!!!!!!!!!!!!!!!!! */
    // root.find(j.JSXElement, {
    //     openingElement: {
    //         name: { name: 'Link' },
    //         // attributes: [
    //         //     {
    //         //         name: { name: 'href' },
    //         //         value: { expression: { type: 'CallExpression', callee: { name: 'reverse' } } },
    //         //     },
    //         // ],
    //     },
    //     // children: [{ type: 'JSXText' }],
    // }).forEach(jsxElement => {
    //     const { node } = jsxElement;

    //     const matchingHref = node.openingElement.attributes.find(
    //         attr => attr.name.name === 'href' && attr.value.expression.type === 'CallExpression' && attr.value.expression.callee.name === 'reverse',
    //     );

    //     if (matchingHref) {
    //         // node.openingElement.attributes[0].name.name === 'href'
    //         const urlPlaceholder = node.openingElement.attributes.find(attribute => attribute.name.name === 'href')?.value.expression.arguments[0];
    //         const optionsObject = node.openingElement.attributes.find(attribute => attribute.name.name === 'href')?.value.expression.arguments[1];

    //         let newHrefProps = {
    //             pathname: urlPlaceholder,
    //         };

    //         if (optionsObject) {
    //             newHrefProps.query = optionsObject;
    //         }

    //         // Extract the dynamic placeholder value
    //         const placeholderValue = node.children[0].value.trim();

    //         // Create new JSX opening element
    //         const newOpeningElement = j.jsxOpeningElement(j.jsxIdentifier('Link'), [
    //             j.jsxAttribute(
    //                 j.jsxIdentifier('href'),
    //                 j.jsxExpressionContainer(
    //                     j.objectExpression([
    //                         j.objectProperty(j.identifier('pathname'), newHrefProps.pathname),
    //                         j.objectProperty(j.identifier('query'), newHrefProps.query || j.nullLiteral()),
    //                     ]),
    //                 ),
    //             ),
    //             ...node.openingElement.attributes.filter(attr => attr.name.name !== 'href'),
    //         ]);

    //         // Create new JSX closing element
    //         const newClosingElement = j.jsxClosingElement(j.jsxIdentifier('Link'));

    //         // Replace placeholder value in JSXText node
    //         node.children[0].value = placeholderValue;

    //         // Create new JSX element
    //         const newJSXElement = j.jsxElement(newOpeningElement, newClosingElement, node.children);

    //         // Replace old JSX element with the new one
    //         j(jsxElement).replaceWith(newJSXElement);
    //     }
    // });

    /** !!!!!!!!!!!!!!!!!!!!END NEW!!!!!!!!!!!!!!!!!!!!! */

    /*
    #########################################################################################
    Replace
        import 'react-router-dom';
    with
        (nothing)
    */
    // Find the import declaration for 'react-router-dom'
    const reactRouterImport = root.find(j.ImportDeclaration, {
        source: {
            value: 'react-router-dom',
        },
    });

    // Check if the import declaration has no named imports
    const hasNoNamedImports = reactRouterImport.find(j.ImportSpecifier).length === 0;

    // Remove the 'react-router-dom' import declaration if there are no named imports
    if (hasNoNamedImports) {
        reactRouterImport.remove();
    }

    return source.toSource();
};
